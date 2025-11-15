from sqlalchemy import func, desc
from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from ..extensions import db
from ..models import NguoiDung, DonHang, ChiTietDonHang, ThanhToan, DiaChi
from ..models.enums import VaiTroNguoiDungEnum, TrangThaiNguoiDungEnum, TrangThaiDonHangEnum
from ..schemas.nguoidung.NguoiDung import NguoiDungResponse




class KhachHangService:
    @staticmethod
    def lay_danh_sach_khach_hang(
        page: int = 1,
        per_page: int = 20,
        ho_ten: Optional[str] = None,
        email: Optional[str] = None,
        so_dien_thoai: Optional[str] = None,
        trang_thai: Optional[TrangThaiNguoiDungEnum] = None
    ) -> Dict[str, Any]:
        """
        Lấy danh sách khách hàng với phân trang và lọc
        """
        try:
            # Query cơ bản lấy khách hàng (vai trò KHACH_HANG)
            query = NguoiDung.query.filter_by(vai_tro=VaiTroNguoiDungEnum.KHACH_HANG)
            
            # Áp dụng bộ lọc
            if ho_ten:
                query = query.filter(NguoiDung.ho_ten.ilike(f"%{ho_ten}%"))
            if email:
                query = query.filter(NguoiDung.email.ilike(f"%{email}%"))
            if so_dien_thoai:
                query = query.filter(NguoiDung.so_dien_thoai.ilike(f"%{so_dien_thoai}%"))
            if trang_thai:
                query = query.filter(NguoiDung.trang_thai == trang_thai)
            
            # Phân trang
            pagination = query.paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )
            
            # Lấy thống kê cho từng khách hàng
            khach_hang_list = []
            for khach_hang in pagination.items:
                thong_ke = KhachHangService._thong_ke_khach_hang(khach_hang.id)
                
                khach_hang_data = {
                    'id': khach_hang.id,
                    'ma_nguoi_dung': khach_hang.ma_nguoi_dung,
                    'ho_ten': khach_hang.ho_ten,
                    'email': khach_hang.email,
                    'so_dien_thoai': khach_hang.so_dien_thoai,
                    'trang_thai': khach_hang.trang_thai,
                    'ngay_tao': khach_hang.ngay_tao,
                    'so_luong_don_hang': thong_ke['so_luong_don_hang'],
                    'tong_tien_da_mua': thong_ke['tong_tien_da_mua']
                }
                khach_hang_list.append(khach_hang_data)
            
            return {
                'data': khach_hang_list,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total': pagination.total,
                    'pages': pagination.pages
                }
            }
            
        except Exception as e:
            raise e

    @staticmethod
    def _thong_ke_khach_hang(nguoi_dung_id: int) -> Dict[str, Any]:
        """
        Thống kê số lượng đơn hàng và tổng tiền của khách hàng
        """
        # Đếm số đơn hàng
        so_luong_don_hang = DonHang.query.filter_by(nguoi_dung_id=nguoi_dung_id).count()
        
        # Tính tổng tiền từ các đơn hàng đã thanh toán thành công
        tong_tien_result = db.session.query(
            func.sum(ChiTietDonHang.so_luong * ChiTietDonHang.don_gia_luc_mua)
        ).join(DonHang, ChiTietDonHang.don_hang_id == DonHang.id
        ).filter(
            DonHang.nguoi_dung_id == nguoi_dung_id
        ).scalar()
        
        tong_tien_da_mua = tong_tien_result if tong_tien_result else Decimal('0')
        
        return {
            'so_luong_don_hang': so_luong_don_hang,
            'tong_tien_da_mua': tong_tien_da_mua
        }

    @staticmethod
    def cap_nhat_trang_thai_khach_hang(khach_hang_id: int, trang_thai_moi: TrangThaiNguoiDungEnum) -> NguoiDung:
        """
        Cập nhật trạng thái khách hàng (khoá/kích hoạt)
        """
        try:
            khach_hang = NguoiDung.query.filter_by(
                id=khach_hang_id, 
                vai_tro=VaiTroNguoiDungEnum.KHACH_HANG
            ).first()
            
            if not khach_hang:
                raise ValueError("Khách hàng không tồn tại")
            
            khach_hang.trang_thai = trang_thai_moi
            db.session.commit()
            
            return khach_hang
            
        except Exception as e:
            db.session.rollback()
            raise e

    @staticmethod
    def lay_chi_tiet_khach_hang(khach_hang_id: int) -> Dict[str, Any]:
        """
        Lấy chi tiết thông tin khách hàng
        """
        try:
            khach_hang = NguoiDung.query.filter_by(
                id=khach_hang_id,
                vai_tro=VaiTroNguoiDungEnum.KHACH_HANG
            ).first()
            
            if not khach_hang:
                raise ValueError("Khách hàng không tồn tại")
            
            # Lấy thông tin cơ bản
            chi_tiet = {
                'thong_tin_co_ban': {
                    'id': khach_hang.id,
                    'ma_nguoi_dung': khach_hang.ma_nguoi_dung,
                    'ho_ten': khach_hang.ho_ten,
                    'email': khach_hang.email,
                    'so_dien_thoai': khach_hang.so_dien_thoai,
                    'trang_thai': khach_hang.trang_thai,
                    'ngay_tao': khach_hang.ngay_tao,
                    'lan_cuoi_dang_nhap': khach_hang.lan_cuoi_dang_nhap
                },
                'thong_ke': KhachHangService._thong_ke_khach_hang(khach_hang_id),
                'dia_chi': [],
                'don_hang_gan_day': []
            }
            dia_chi_list = DiaChi.query.filter_by(nguoi_dung_id=khach_hang_id).all()
            
            # Lấy danh sách địa chỉ
            for dia_chi in dia_chi_list:
                chi_tiet['dia_chi'].append({
                    'ten_nguoi_nhan': dia_chi.ten_nguoi_nhan,
                    'so_dien_thoai': dia_chi.so_dien_thoai,
                    'phuong_xa': dia_chi.phuong_xa,
                    'tinh_thanh': dia_chi.tinh_thanh,
                    "dia_chi_cu_the": dia_chi.dia_chi_cu_the,
                    'ma_buu_dien': dia_chi.ma_buu_dien,
                    'mac_dinh': dia_chi.la_mac_dinh,
                    'ngay_tao': dia_chi.ngay_tao,
                    'ngay_cap_nhat': dia_chi.ngay_cap_nhat
                })
            
            # Lấy 5 đơn hàng gần nhất
            don_hangs = DonHang.query.filter_by(nguoi_dung_id=khach_hang_id).order_by(desc(DonHang.ngay_tao)).limit(5).all()
            for don_hang in don_hangs:
                items = ChiTietDonHang.query.filter_by(don_hang_id=don_hang.id).all()
                chi_tiet['don_hang_gan_day'].append({
                    'id': don_hang.id,
                    'ma_don_hang': don_hang.ma_don_hang,
                    'trang_thai': don_hang.trang_thai,
                    'tong_tien': sum(item.so_luong * item.don_gia_luc_mua for item in don_hang.items),
                    'ngay_tao': don_hang.ngay_tao,
                    "chi_tiet_don_hang": [{
                        'ten_san_pham_luc_mua': item.ten_san_pham_luc_mua,
                        'don_gia_luc_mua': item.don_gia_luc_mua,
                        'so_luong': item.so_luong,
                    } for item in items] 
                })  
            
            return chi_tiet
            
        except Exception as e:
            raise e