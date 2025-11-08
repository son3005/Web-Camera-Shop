# /backend/app/services/order_service.py
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from contextlib import contextmanager
from typing import List, Dict, Any, Optional

from sqlalchemy import func, or_, select, update, and_
from sqlalchemy.orm import selectinload

from backend.app.services.redis_session_service import RedisSessionService

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

import logging
logger = logging.getLogger(__name__)

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
                    phuong_thuc=checkout_data.get('phuong_thuc_thanh_toan'),
                    trang_thai=TrangThaiThanhToanEnum.CHO_THANH_TOAN,
                    ma_giao_dich_ben_thu_3=None # Cập nhật sau khi tích hợp cổng thanh toán
                )
                db.session.add(thanh_toan)
            
            return don_hang
        
    @classmethod
    def create_pending_order(cls, checkout_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
        """Tạo đơn hàng tạm thời (chưa lưu DB) - chỉ lưu trong Redis"""
        try:
            # Validate items nhưng CHƯA trừ tồn kho
            validated_items = cls._validate_items(checkout_data['items'])
            
            # Tạo order data tạm thời
            order_data = {
                'ma_don_hang': cls._generate_order_code(),
                'user_id': user_id,
                'items': validated_items,
                'tong_tien': sum(item['gia_ban'] * item['so_luong'] for item in validated_items),
                'created_at': datetime.utcnow().isoformat(),
                'expires_at': (datetime.utcnow() + timedelta(minutes=30)).isoformat()
            }
            
            # Lưu vào Redis thay vì database
            order_id = f"pending_order_{uuid.uuid4().hex}"
            RedisSessionService.create_session('pending_orders', order_id, order_data)
            
            return {
                'order_id': order_id,
                'order_data': order_data
            }
            
        except Exception as e:
            raise ValueError(f"Lỗi tạo đơn hàng tạm thời: {str(e)}")
        
        
    @classmethod
    def confirm_order_after_payment(cls, pending_order_id: str, payment_data: Dict[str, Any]) -> DonHang:
        """Xác nhận đơn hàng sau khi thanh toán thành công"""
        with db.session.begin():
            # Lấy order tạm từ Redis
            pending_order = RedisSessionService.get_session('pending_orders', pending_order_id)
            if not pending_order:
                raise ValueError("Đơn hàng tạm không tồn tại hoặc đã hết hạn")
            
            # Lấy item IDs để lock tồn kho
            bien_the_ids = [item['bien_the_san_pham_id'] for item in pending_order['items']]
            
            with cls.inventory_lock(bien_the_ids):
                # Kiểm tra lại tồn kho lần cuối
                revalidated_items = cls._validate_items(pending_order['items'])
                
                # TẠO ĐƠN HÀNG THẬT trong database
                don_hang = DonHang(
                    ma_don_hang=pending_order['ma_don_hang'],
                    nguoi_dung_id=pending_order['user_id'],
                    dia_chi_id=payment_data.get('dia_chi_id'),
                    ten_nguoi_nhan=payment_data['ten_nguoi_nhan'],
                    so_dien_thoai_nguoi_nhan=payment_data['so_dien_thoai_nguoi_nhan'],
                    dia_chi_giao=payment_data['dia_chi_giao'],
                    trang_thai=TrangThaiDonHangEnum.CHO_XAC_NHAN,
                    phi_van_chuyen=Decimal(str(payment_data.get('phi_van_chuyen', 0))),
                    ghi_chu=payment_data.get('ghi_chu')
                )
                db.session.add(don_hang)
                db.session.flush()
                
                # Tạo chi tiết đơn hàng và TRỪ TỒN KHO
                total_amount = Decimal('0')
                for item in revalidated_items:
                    chi_tiet = ChiTietDonHang(
                        don_hang_id=don_hang.id,
                        bien_the_san_pham_id=item['bien_the_san_pham_id'],
                        ten_san_pham_luc_mua=item['ten_san_pham'],
                        ten_bien_the_luc_mua=item['ten_bien_the'],
                        don_gia_luc_mua=Decimal(str(item['gia_ban'])),
                        so_luong=item['so_luong']
                    )
                    db.session.add(chi_tiet)
                    
                    # TRỪ TỒN KHO - CHỈ THỰC HIỆN KHI THANH TOÁN THÀNH CÔNG
                    stmt = update(BienTheSanPham).where(
                        BienTheSanPham.id == item['bien_the_san_pham_id']
                    ).values(so_luong=BienTheSanPham.so_luong - item['so_luong'])
                    db.session.execute(stmt)
                    
                    total_amount += Decimal(str(item['gia_ban'])) * item['so_luong']
                
                # Tạo thanh toán
                thanh_toan = ThanhToan(
                    don_hang_id=don_hang.id,
                    so_tien=total_amount + don_hang.phi_van_chuyen,
                    phuong_thuc=payment_data.get('phuong_thuc_thanh_toan'),
                    trang_thai=TrangThaiThanhToanEnum.DA_THANH_TOAN,  # Đã thanh toán
                    ma_giao_dich_ben_thu_3=payment_data.get('ma_giao_dich')
                )
                db.session.add(thanh_toan)
                
                # Xóa order tạm trong Redis
                RedisSessionService.delete_session('pending_orders', pending_order_id)
                
                return don_hang
        
    @classmethod
    def process_payment_success(cls, thanh_toan_id: int):
        """Xử lý khi thanh toán thành công"""
        with db.session.begin():
            thanh_toan = db.session.query(ThanhToan).get(thanh_toan_id)
            if thanh_toan:
                thanh_toan.trang_thai = TrangThaiThanhToanEnum.DA_THANH_TOAN
                thanh_toan.don_hang.trang_thai = TrangThaiDonHangEnum.DA_XAC_NHAN
                thanh_toan.ngay_cap_nhat = datetime.utcnow()

    @classmethod
    def process_payment_failure(cls, thanh_toan_id: int):
        """Xử lý khi thanh toán thất bại"""
        with db.session.begin():
            thanh_toan = db.session.query(ThanhToan).get(thanh_toan_id)
            if thanh_toan:
                thanh_toan.trang_thai = TrangThaiThanhToanEnum.THAT_BAI
                thanh_toan.don_hang.trang_thai = TrangThaiDonHangEnum.DA_HUY
                thanh_toan.ngay_cap_nhat = datetime.utcnow()
                
                # Hoàn lại tồn kho
                for item in thanh_toan.don_hang.items:
                    if item.bien_the_san_pham:
                        item.bien_the_san_pham.so_luong += item.so_luong
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

    @classmethod
    def get_order_detail(cls, order_id: int, user_id: Optional[int] = None, is_admin: bool = False) -> Optional[DonHang]:
        """Lấy chi tiết đơn hàng với kiểm tra quyền"""
        from sqlalchemy import select, or_
        
        query = select(DonHang).options(
            selectinload(DonHang.items),
            selectinload(DonHang.thanh_toan),
            selectinload(DonHang.nguoi_dung),
            selectinload(DonHang.dia_chi)
        ).where(DonHang.id == order_id)
        
        # Nếu không phải admin, chỉ cho phép xem đơn hàng của chính mình
        if not is_admin and user_id:
            query = query.where(DonHang.nguoi_dung_id == user_id)
        
        return db.session.execute(query).scalar_one_or_none()

    @classmethod
    def update_order_status(
        cls, 
        order_id: int, 
        new_status: TrangThaiDonHangEnum,
        user_id: Optional[int] = None,
        is_admin: bool = False
    ) -> DonHang:
        """Cập nhật trạng thái đơn hàng"""
        with db.session.begin():
            # Lấy đơn hàng với kiểm tra quyền
            order = cls.get_order_detail(order_id, user_id, is_admin)
            if not order:
                raise ValueError("Đơn hàng không tồn tại hoặc không có quyền truy cập")
            
            # Validate trạng thái mới
            cls._validate_status_transition(order.trang_thai, new_status, is_admin)
            
            # Cập nhật trạng thái
            old_status = order.trang_thai
            order.trang_thai = new_status
            order.ngay_cap_nhat = datetime.utcnow()
            
            # Xử lý đặc biệt khi hủy đơn hàng
            if new_status == TrangThaiDonHangEnum.DA_HUY:
                cls._handle_order_cancellation(order)
            
            return order

    @classmethod
    def update_order_status(
        cls, 
        order_id: int, 
        new_status: TrangThaiDonHangEnum,
        user_id: Optional[int] = None,
        is_admin: bool = False
    ) -> DonHang:
        """Cập nhật trạng thái đơn hàng"""
        with db.session.begin():
            # Lấy đơn hàng với kiểm tra quyền
            order = cls.get_order_detail(order_id, user_id, is_admin)
            if not order:
                raise ValueError("Đơn hàng không tồn tại hoặc không có quyền truy cập")
            
            # Validate trạng thái mới
            cls._validate_status_transition(order.trang_thai, new_status, is_admin)
            
            # Cập nhật trạng thái
            old_status = order.trang_thai
            order.trang_thai = new_status
            order.ngay_cap_nhat = datetime.utcnow()
            
            # Xử lý đặc biệt khi hủy đơn hàng
            if new_status == TrangThaiDonHangEnum.DA_HUY:
                cls._handle_order_cancellation(order)
            
            # Ghi log hoặc thông báo về việc thay đổi trạng thái
            cls._log_status_change(order, old_status, new_status)
            
            return order

    @classmethod
    def _validate_status_transition(
        cls, 
        current_status: TrangThaiDonHangEnum, 
        new_status: TrangThaiDonHangEnum,
        is_admin: bool
    ):
        """Validate việc chuyển trạng thái đơn hàng"""
        valid_transitions = {
            TrangThaiDonHangEnum.CHO_XAC_NHAN: [
                TrangThaiDonHangEnum.DA_XAC_NHAN,
                TrangThaiDonHangEnum.DA_HUY
            ],
            TrangThaiDonHangEnum.DA_XAC_NHAN: [
                TrangThaiDonHangEnum.DANG_GIAO_HANG,
                TrangThaiDonHangEnum.DA_HUY
            ],
            TrangThaiDonHangEnum.DANG_GIAO_HANG: [
                TrangThaiDonHangEnum.HOAN_THANH,
                TrangThaiDonHangEnum.YEU_CAU_TRA_HANG
            ],
            TrangThaiDonHangEnum.YEU_CAU_TRA_HANG: [
                TrangThaiDonHangEnum.DA_TRA_HANG,
                TrangThaiDonHangEnum.DA_HUY
            ]
        }
        
        # Admin có thể chuyển sang bất kỳ trạng thái nào
        if is_admin:
            return
            
        # User chỉ có thể hủy đơn hàng khi ở trạng thái CHỜ_XÁC_NHẬN
        if not is_admin and new_status == TrangThaiDonHangEnum.DA_HUY:
            if current_status != TrangThaiDonHangEnum.CHO_XAC_NHAN:
                raise ValueError("Chỉ có thể hủy đơn hàng khi đang chờ xác nhận")
            return
            
        # Kiểm tra chuyển trạng thái hợp lệ
        allowed_transitions = valid_transitions.get(current_status, [])
        if new_status not in allowed_transitions:
            raise ValueError(f"Không thể chuyển từ {current_status.value} sang {new_status.value}")

    @classmethod
    def _handle_order_cancellation(cls, order: DonHang):
        """Xử lý khi hủy đơn hàng - hoàn lại tồn kho"""
        for item in order.items:
            if item.bien_the_san_pham:
                # Hoàn lại số lượng tồn kho
                from sqlalchemy import update
                stmt = update(BienTheSanPham).where(
                    BienTheSanPham.id == item.bien_the_san_pham_id
                ).values(so_luong=BienTheSanPham.so_luong + item.so_luong)
                db.session.execute(stmt)
        
        # Cập nhật trạng thái thanh toán nếu có
        if order.thanh_toan:
            order.thanh_toan.trang_thai = TrangThaiThanhToanEnum.DA_HUY

    @classmethod
    def _log_status_change(cls, order: DonHang, old_status: TrangThaiDonHangEnum, new_status: TrangThaiDonHangEnum):
        """Ghi log thay đổi trạng thái đơn hàng"""
        # Có thể lưu vào bảng order_history hoặc ghi log
        logger.info(f"Đơn hàng {order.ma_don_hang} chuyển từ {old_status.value} sang {new_status.value}")

    @classmethod
    def get_user_orders(
        cls, 
        user_id: int, 
        page: int = 1, 
        per_page: int = 10,
        status: Optional[TrangThaiDonHangEnum] = None
    ) -> tuple[List[DonHang], int]:
        """Lấy danh sách đơn hàng của user với phân trang và lọc"""
        from sqlalchemy import select, func
        
        query = select(DonHang).where(DonHang.nguoi_dung_id == user_id)
        
        if status:
            query = query.where(DonHang.trang_thai == status)
            
        query = query.order_by(DonHang.ngay_tao.desc())
        
        # Phân trang
        total = db.session.execute(
            select(func.count()).select_from(query.subquery())
        ).scalar()
        
        orders = db.session.execute(
            query.offset((page - 1) * per_page).limit(per_page)
        ).scalars().all()
        
        return orders, total

    @classmethod
    def get_all_orders(
        cls,
        page: int = 1,
        per_page: int = 10,
        status: Optional[TrangThaiDonHangEnum] = None,
        search: Optional[str] = None
    ) -> tuple[List[DonHang], int]:
        """Lấy tất cả đơn hàng (cho admin)"""
        from sqlalchemy import select, func, or_
        
        query = select(DonHang).options(
            selectinload(DonHang.nguoi_dung),
            selectinload(DonHang.thanh_toan)
        )
        
        # Lọc theo trạng thái
        if status:
            query = query.where(DonHang.trang_thai == status)
            
        # Tìm kiếm theo mã đơn hàng hoặc tên người nhận
        if search:
            query = query.where(
                or_(
                    DonHang.ma_don_hang.ilike(f"%{search}%"),
                    DonHang.ten_nguoi_nhan.ilike(f"%{search}%")
                )
            )
            
        query = query.order_by(DonHang.ngay_tao.desc())
        
        # Phân trang
        total = db.session.execute(
            select(func.count()).select_from(query.subquery())
        ).scalar()
        
        orders = db.session.execute(
            query.offset((page - 1) * per_page).limit(per_page)
        ).scalars().all()
        
        return orders, total

    