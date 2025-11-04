from datetime import datetime
from ...extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from ..enums import VaiTroNguoiDungEnum, TrangThaiNguoiDungEnum

class NguoiDung(db.Model):
    """
    Lớp NguoiDung đại diện cho người dùng trong hệ thống.
    
    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi người dùng.
        ma_nguoi_dung (str): Mã người dùng duy nhất, không được trùng lặp.
        ho_ten (str): Họ và tên của người dùng.
        so_dien_thoai (str, optional): Số điện thoại của người dùng, duy nhất, có thể để trống.
        email (str): Địa chỉ email của người dùng, duy nhất.
        mat_khau_hash (str): Mật khẩu đã được mã hóa.
        lan_cuoi_dang_nhap (datetime, optional): Thời điểm người dùng đăng nhập lần cuối.
        vai_tro (VaiTroNguoiDungEnum): Vai trò của người dùng (ví dụ: khách hàng, quản trị viên).
        trang_thai (TrangThaiNguoiDungEnum): Trạng thái hoạt động của người dùng (ví dụ: kích hoạt, bị khóa).
        ngay_tao (datetime): Thời điểm tạo tài khoản.
        ngay_cap_nhat (datetime): Thời điểm cập nhật thông tin gần nhất.

    Quan hệ:
        gio_hang (GioHang): Giỏ hàng của người dùng (một-một).
        don_hangs (DonHang): Danh sách đơn hàng của người dùng (một-nhiều).
        phieu_thus (PhieuThu): Danh sách phiếu thu của người dùng (một-nhiều).
        danh_gias (DanhGia): Danh sách đánh giá của người dùng (một-nhiều).
        dia_chis (DiaChi): Danh sách địa chỉ của người dùng (một-nhiều).

    Phương thức:
        __repr__(): Trả về chuỗi biểu diễn đối tượng người dùng, bao gồm email và vai trò.
    """
    __tablename__ = 'nguoi_dung'
    
    id = db.Column(db.Integer, primary_key=True)
    ma_nguoi_dung = db.Column(db.String(20), unique=True, nullable=False, index=True)
    ho_ten = db.Column(db.String(100), nullable=False)
    so_dien_thoai = db.Column(db.String(15), unique=True, index=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    mat_khau_hash = db.Column(db.String(256), nullable=False)
    lan_cuoi_dang_nhap = db.Column(db.DateTime, nullable=True)

    vai_tro = db.Column(
        db.Enum(VaiTroNguoiDungEnum),
        nullable=False,
        default=VaiTroNguoiDungEnum.KHACH_HANG
    )
    trang_thai = db.Column(
        db.Enum(TrangThaiNguoiDungEnum),
        default=TrangThaiNguoiDungEnum.KICH_HOAT,
        nullable=False
    )
    
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __mapper_args__ = {
        'polymorphic_identity': 'nguoi_dung',
        'polymorphic_on': vai_tro
    }

    # --- QUAN HỆ - Sử dụng string reference ---
    gio_hang = db.relationship('GioHang', back_populates='nguoi_dung', uselist=False, cascade="all, delete-orphan")
    don_hangs = db.relationship('DonHang', back_populates='nguoi_dung', lazy='dynamic')
    phieu_thus = db.relationship('PhieuThu', back_populates='nguoi_dung', lazy='dynamic')  # String reference
    danh_gias = db.relationship('DanhGia', back_populates='nguoi_dung', lazy='dynamic')
    dia_chis = db.relationship('DiaChi', back_populates='nguoi_dung', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<NguoiDung {self.email} ({self.vai_tro.value})>'

class KhachHang(NguoiDung):
    __mapper_args__ = {
        'polymorphic_identity': VaiTroNguoiDungEnum.KHACH_HANG
    }

class QuanTriVien(NguoiDung):
    __mapper_args__ = {
        'polymorphic_identity': VaiTroNguoiDungEnum.QUAN_TRI_VIEN
    }