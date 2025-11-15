import logging
import bcrypt
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import BadRequest, Conflict, NotFound

from ..extensions import db
from ..models.nguoidung import NguoiDung
from ..schemas.nguoidung.NguoiDung import (
    NguoiDungUpdate, 
    NguoiDungUpdateMatKhau,
    NguoiDungResponse
)


class NguoiDungService:
    """
    Service xử lý nghiệp vụ cho module Người dùng
    """

    @staticmethod
    def hash_password(raw_password: str) -> str:
        """Tạo hash mật khẩu bằng bcrypt."""
        logging.debug("Bắt đầu hash mật khẩu")
        # Sử dụng bcrypt để hash password
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
        return hashed.decode('utf-8')

    @staticmethod
    def check_password(hash_stored: str, raw_password: str) -> bool:
        """Kiểm tra mật khẩu bằng bcrypt."""
        logging.debug("Bắt đầu kiểm tra mật khẩu")
        try:
            return bcrypt.checkpw(raw_password.encode('utf-8'), hash_stored.encode('utf-8'))
        except Exception as e:
            logging.error(f"Lỗi kiểm tra mật khẩu: {e}")
            return False
    
    @staticmethod
    def lay_nguoi_dung_theo_id(nguoi_dung_id: int) -> NguoiDung:
        """
        Lấy thông tin người dùng theo ID
        """
        nguoi_dung = NguoiDung.query.get(nguoi_dung_id)
        if not nguoi_dung:
            raise NotFound("Người dùng không tồn tại")
        return nguoi_dung

    @staticmethod
    def lay_thong_tin_ca_nhan(nguoi_dung: NguoiDung) -> NguoiDung:
        """
        Lấy thông tin chi tiết người dùng cá nhân
        """
        return nguoi_dung

    @staticmethod
    def cap_nhat_thong_tin(nguoi_dung: NguoiDung, du_lieu_cap_nhat: NguoiDungUpdate) -> NguoiDung:
        """
        Cập nhật thông tin cá nhân: họ tên, số điện thoại, email
        """
        # Kiểm tra email trùng lặp (trừ chính người dùng hiện tại)
        if du_lieu_cap_nhat.email and du_lieu_cap_nhat.email != nguoi_dung.email:
            nguoi_dung_ton_tai = NguoiDung.query.filter_by(email=du_lieu_cap_nhat.email).first()
            if nguoi_dung_ton_tai and nguoi_dung_ton_tai.id != nguoi_dung.id:
                raise Conflict("Email đã được sử dụng bởi người dùng khác")

        # Kiểm tra số điện thoại trùng lặp
        if du_lieu_cap_nhat.so_dien_thoai and du_lieu_cap_nhat.so_dien_thoai != nguoi_dung.so_dien_thoai:
            so_dt_ton_tai = NguoiDung.query.filter_by(so_dien_thoai=du_lieu_cap_nhat.so_dien_thoai).first()
            if so_dt_ton_tai and so_dt_ton_tai.id != nguoi_dung.id:
                raise Conflict("Số điện thoại đã được sử dụng bởi người dùng khác")

        # Cập nhật thông tin
        if du_lieu_cap_nhat.ho_ten is not None:
            nguoi_dung.ho_ten = du_lieu_cap_nhat.ho_ten
        if du_lieu_cap_nhat.so_dien_thoai is not None:
            nguoi_dung.so_dien_thoai = du_lieu_cap_nhat.so_dien_thoai
        if du_lieu_cap_nhat.email is not None:
            nguoi_dung.email = du_lieu_cap_nhat.email

        try:
            db.session.commit()
            return nguoi_dung
        except IntegrityError as e:
            db.session.rollback()
            raise Conflict("Lỗi cập nhật thông tin: dữ liệu trùng lặp")

    @staticmethod
    def doi_mat_khau(nguoi_dung: NguoiDung, du_lieu_mat_khau: NguoiDungUpdateMatKhau) -> bool:
        """
        Đổi mật khẩu người dùng
        """
        logging.info(f"Attempting to change password for user ID: {nguoi_dung.id}")
        
        # Kiểm tra mật khẩu hiện tại
        if not NguoiDungService.check_password(nguoi_dung.mat_khau_hash, du_lieu_mat_khau.mat_khau_cu):
            raise BadRequest("Mật khẩu hiện tại không đúng")

        # Đảm bảo mật khẩu mới không trùng với mật khẩu cũ
        if NguoiDungService.check_password(nguoi_dung.mat_khau_hash, du_lieu_mat_khau.mat_khau_moi):
            raise BadRequest("Mật khẩu mới không được trùng với mật khẩu cũ")

        # Mã hóa mật khẩu mới bằng bcrypt
        nguoi_dung.mat_khau_hash = NguoiDungService.hash_password(du_lieu_mat_khau.mat_khau_moi)
        
        db.session.commit()
        logging.info(f"Password changed successfully for user ID: {nguoi_dung.id}")
        return True

    @staticmethod
    def kiem_tra_mat_khau(nguoi_dung: NguoiDung, mat_khau_plain: str) -> bool:
        """
        Kiểm tra mật khẩu hiện tại
        """
        return NguoiDungService.check_password(nguoi_dung.mat_khau_hash, mat_khau_plain)