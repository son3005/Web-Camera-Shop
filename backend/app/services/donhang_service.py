# /backend/app/services/order_service.py
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from contextlib import contextmanager
from typing import List, Dict, Any, Optional

from sqlalchemy import select, update, and_
from sqlalchemy.orm import selectinload

from ..extensions import db, redis
from ..models import (
    DonHang, ChiTietDonHang, ThanhToan, 
    BienTheSanPham, NguoiDung, DiaChi
)
from ..models.enums import (
    TrangThaiDonHangEnum, 
    TrangThaiThanhToanEnum, 
    PhuongThucThanhToanEnum
)

class DonHangService:
    @staticmethod
    @contextmanager
    def inventory_lock(bien_the_ids: List[int]):
        """Context manager để lock tồn kho"""
        # Lock các biến thể sản phẩm trong transaction
        stmt = select(BienTheSanPham).where(
            BienTheSanPham.id.in_(bien_the_ids)
        ).with_for_update()
        
        db.session.execute(stmt)
        yield

    @classmethod
    def create_order_from_checkout(
        cls, 
        checkout_data: Dict[str, Any], 
        user_id: Optional[int] = None
    ) -> DonHang:
        """Tạo đơn hàng từ checkout session với transaction"""
        
        with db.session.begin():
            # 1. Lock tồn kho
            bien_the_ids = [item['bien_the_san_pham_id'] for item in checkout_data['items']]
            
            with cls.inventory_lock(bien_the_ids):
                # 2. Kiểm tra lại giá và tồn kho
                validated_items = cls._validate_items(checkout_data['items'])
                
                # 3. Tạo mã đơn hàng
                ma_don_hang = cls._generate_order_code()
                
                # 4. Tạo đơn hàng
                don_hang = DonHang(
                    ma_don_hang=ma_don_hang,
                    nguoi_dung_id=user_id,
                    dia_chi_id=checkout_data.get('dia_chi_id'),
                    ten_nguoi_nhan=checkout_data['ten_nguoi_nhan'],
                    so_dien_thoai_nguoi_nhan=checkout_data['so_dien_thoai_nguoi_nhan'],
                    dia_chi_giao=checkout_data['dia_chi_giao'],
                    trang_thai=TrangThaiDonHangEnum.CHO_XAC_NHAN,
                    phi_van_chuyen=Decimal(str(checkout_data.get('phi_van_chuyen', 0))),
                    ghi_chu=checkout_data.get('ghi_chu')
                )
                db.session.add(don_hang)
                db.session.flush()  # Lấy ID đơn hàng
                
                # 5. Tạo chi tiết đơn hàng và trừ tồn kho
                total_amount = Decimal('0')
                for item in validated_items:
                    chi_tiet = ChiTietDonHang(
                        don_hang_id=don_hang.id,
                        bien_the_san_pham_id=item['bien_the_san_pham_id'],
                        ten_san_pham_luc_mua=item['ten_san_pham'],
                        ten_bien_the_luc_mua=item['ten_bien_the'],
                        don_gia_luc_mua=Decimal(str(item['gia_ban'])),
                        so_luong=item['so_luong']
                    )
                    db.session.add(chi_tiet)
                    
                    # Trừ tồn kho
                    stmt = update(BienTheSanPham).where(
                        BienTheSanPham.id == item['bien_the_san_pham_id']
                    ).values(so_luong=BienTheSanPham.so_luong - item['so_luong'])
                    db.session.execute(stmt)
                    
                    total_amount += Decimal(str(item['gia_ban'])) * item['so_luong']
                
                # 6. Tạo thanh toán
                thanh_toan = ThanhToan(
                    don_hang_id=don_hang.id,
                    so_tien=total_amount + don_hang.phi_van_chuyen,
                    phuong_thuc=checkout_data.get('phuong_thuc_thanh_toan', PhuongThucThanhToanEnum.COD),
                    trang_thai=TrangThaiThanhToanEnum.CHO_THANH_TOAN,
                    ma_giao_dich_ben_thu_3=None
                )
                db.session.add(thanh_toan)
            
            return don_hang

    @staticmethod
    def _validate_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Kiểm tra lại giá và tồn kho trước khi tạo đơn"""
        validated_items = []
        
        for item in items:
            bien_the = db.session.execute(
                select(BienTheSanPham).options(
                    selectinload(BienTheSanPham.san_pham)
                ).where(BienTheSanPham.id == item['bien_the_san_pham_id'])
            ).scalar_one_or_none()
            
            if not bien_the:
                raise ValueError(f"Biến thể sản phẩm {item['bien_the_san_pham_id']} không tồn tại")
            
            if bien_the.so_luong < item['so_luong']:
                raise ValueError(f"Biến thể {bien_the.ten_bien_the} không đủ tồn kho")
            
            # Kiểm tra giá có thay đổi không
            current_price = bien_the.gia_ban
            if Decimal(str(item['gia_ban'])) != current_price:
                raise ValueError(f"Giá sản phẩm {bien_the.ten_bien_the} đã thay đổi")
            
            validated_items.append({
                **item,
                'ten_san_pham': bien_the.san_pham.ten_san_pham,
                'ten_bien_the': bien_the.ten_bien_the,
                'gia_ban': float(current_price)
            })
        
        return validated_items

    @staticmethod
    def _generate_order_code() -> str:
        """Tạo mã đơn hàng duy nhất"""
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        random_str = uuid.uuid4().hex[:6].upper()
        return f"DH{timestamp}{random_str}"

    @classmethod
    def cancel_expired_orders(cls):
        """Hủy các đơn hàng quá hạn thanh toán"""
        expired_time = datetime.utcnow() - timedelta(minutes=15)
        
        with db.session.begin():
            # Tìm đơn hàng quá hạn
            expired_orders = db.session.execute(
                select(DonHang).join(ThanhToan).where(
                    and_(
                        DonHang.trang_thai == TrangThaiDonHangEnum.CHO_XAC_NHAN,
                        ThanhToan.trang_thai == TrangThaiThanhToanEnum.CHO_THANH_TOAN,
                        ThanhToan.ngay_tao < expired_time
                    )
                ).options(selectinload(DonHang.items))
            ).scalars().all()
            
            for order in expired_orders:
                # Cập nhật trạng thái đơn hàng
                order.trang_thai = TrangThaiDonHangEnum.DA_HUY
                
                # Hoàn lại tồn kho
                for item in order.items:
                    if item.bien_the_san_pham:
                        item.bien_the_san_pham.so_luong += item.so_luong
                
                # Cập nhật trạng thái thanh toán
                order.thanh_toan.trang_thai = TrangThaiThanhToanEnum.DA_HUY