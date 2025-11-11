from typing import Dict, Optional
import uuid
import json
from datetime import datetime
from decimal import Decimal

from ..services.kho_service import KhoService
from ..models.enums import PhuongThucThanhToanEnum, TrangThaiDonHangEnum, TrangThaiThanhToanEnum

class DonHangThatService:
    def __init__(self, db):
        self.db = db
    
    def tao_ma_don_hang(self) -> str:
        """Tạo mã đơn hàng 25 ký tự: DH + thời gian + uuid"""
        now = datetime.now()
        time_part = now.strftime("%Y%m%d%H%M%S")  # 14 ký tự
        uuid_part = str(uuid.uuid4())[:8]  # 8 ký tự đầu của UUID
        return f"DH{time_part}{uuid_part}"  # Tổng 2 + 14 + 8 = 24 ký tự
    
    def chuyen_doi_don_hang_that(self, don_hang_ao, kho_service: KhoService) -> Dict:
        """
        Chuyển đổi đơn hàng ảo thành đơn hàng thật
        """
        from ..models.giohang_dathang import DonHang, ChiTietDonHang, ThanhToan
        
        try:
            # Tạo mã đơn hàng
            ma_don_hang = self.tao_ma_don_hang()
            
            # Xử lý địa chỉ giao
            dia_chi_giao_hoan_chinh = self.xu_ly_dia_chi_giao(
                don_hang_ao.id_dia_chi, 
                don_hang_ao.dia_chi_giao
            )
            
            # Tạo đơn hàng
            don_hang = DonHang(
                ma_don_hang=ma_don_hang,
                nguoi_dung_id=don_hang_ao.id_nguoi_dung,
                dia_chi_id=don_hang_ao.id_dia_chi,
                ten_nguoi_nhan=don_hang_ao.ten_nguoi_nhan,
                so_dien_thoai_nguoi_nhan=don_hang_ao.so_dien_thoai_nguoi_nhan,
                dia_chi_giao=dia_chi_giao_hoan_chinh,
                phi_van_chuyen=don_hang_ao.phi_van_chuyen or Decimal('2000'),
                ghi_chu=don_hang_ao.ghi_chu,
                trang_thai=TrangThaiDonHangEnum.CHO_XAC_NHAN,
                ngay_tao=datetime.now()
            )
            
            self.db.session.add(don_hang)
            self.db.session.flush() 
            
            # Tạo chi tiết đơn hàng
            for item in don_hang_ao.items_enriched:
                chi_tiet = ChiTietDonHang(
                    don_hang_id=don_hang.id,
                    bien_the_san_pham_id=item['id_bien_the'],
                    ten_san_pham_luc_mua=f"{item['ten_san_pham']} - {item['ten_bien_the']}",
                    don_gia_luc_mua=item['don_gia'],
                    so_luong=item['so_luong']
                )
                self.db.session.add(chi_tiet)
            
            # SỬA ENUM Ở ĐÂY - DÙNG TrangThaiThanhToanEnum
            thanh_toan = ThanhToan(
                don_hang_id=don_hang.id,
                so_tien=don_hang_ao.tong_tien,
                phuong_thuc=don_hang_ao.phuong_thuc_thanh_toan,
                trang_thai=TrangThaiThanhToanEnum.DA_THANH_TOAN if don_hang_ao.phuong_thuc_thanh_toan != 'cod' else TrangThaiThanhToanEnum.CHO_THANH_TOAN,
                ma_giao_dich_ben_thu_3=don_hang_ao.ma_giao_dich_payos,
                ngay_tao=datetime.now()
            )
            self.db.session.add(thanh_toan)
            
            # Cập nhật số lượng kho
            kho_service.cap_nhat_so_luong_khi_thanh_cong(don_hang_ao.items_enriched)
            
            # Commit transaction
            self.db.session.commit()
            
            return {
                "id": don_hang.id,
                "ma_don_hang": ma_don_hang,
                "message": "Tạo đơn hàng thành công"
            }
            
        except Exception as e:
            self.db.session.rollback()
            raise e
    
    def xu_ly_dia_chi_giao(self, id_dia_chi: Optional[int], dia_chi_giao: str) -> str:
        """Xử lý địa chỉ giao hàng hoàn chỉnh"""
        if id_dia_chi:
            from ..models.nguoidung import DiaChi
            dia_chi = DiaChi.query.get(id_dia_chi)
            if dia_chi:
                # THÊM KIỂM TRA NULL CHO CÁC TRƯỜNG
                tinh_thanh = dia_chi.tinh_thanh or ""
                phuong_xa = dia_chi.phuong_xa or ""
                dia_chi_cu_the = dia_chi.dia_chi_cu_the or ""
                return f"{tinh_thanh}, {phuong_xa}, {dia_chi_cu_the}".strip(", ")
        
        return dia_chi_giao