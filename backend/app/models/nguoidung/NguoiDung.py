from datetime import datetime
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
import enum

# CẢI TIẾN: Sử dụng giá trị snake_case cho Enum để nhất quán
class VaiTroNguoiDung(enum.Enum):
    KHACH_HANG = 'khach_hang'
    QUAN_TRI_VIEN = 'quan_tri_vien'

class TrangThaiNguoiDung(enum.Enum):
    KICH_HOAT = 'kich_hoat'
    KHOA = 'khoa'

class NguoiDung(db.Model):
    __tablename__ = 'nguoi_dung'
    
    id = db.Column(db.Integer, primary_key=True)
    ho_ten = db.Column(db.String(100), nullable=True)
    so_dien_thoai = db.Column(db.String(15), unique=True, index=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    mat_khau_hash = db.Column(db.String(256), nullable=False)
    
    # Cột `vai_tro` dùng để phân biệt các lớp con (polymorphism)
    vai_tro = db.Column(db.Enum(VaiTroNguoiDung), nullable=False, default=VaiTroNguoiDung.KHACH_HANG)
    trang_thai = db.Column(db.Enum(TrangThaiNguoiDung), default=TrangThaiNguoiDung.KICH_HOAT, nullable=False)
    
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Cấu hình Polymorphism ---
    __mapper_args__ = {
        'polymorphic_identity': 'nguoi_dung',
        'polymorphic_on': vai_tro
    }

    # --- Các mối quan hệ ---
    gio_hang = db.relationship('GioHang', back_populates='nguoi_dung', uselist=False, cascade="all, delete-orphan")
    don_hangs = db.relationship('DonHang', back_populates='nguoi_dung', lazy='dynamic')
    danh_gias = db.relationship('DanhGia', back_populates='nguoi_dung', lazy='dynamic')
    dia_chis = db.relationship('DiaChi', back_populates='nguoi_dung', lazy='dynamic', cascade="all, delete-orphan")

    # --- Phương thức xử lý mật khẩu ---
    def set_password(self, matkhau):
        """Tạo hash từ mật khẩu."""
        self.mat_khau_hash = generate_password_hash(matkhau)

    def check_password(self, matkhau):
        """Kiểm tra mật khẩu với hash đã lưu."""
        return check_password_hash(self.mat_khau_hash, matkhau)

    def __repr__(self):
        return f'<Người dùng {self.email} - Vai trò: {self.vai_tro.value}>'

# Lớp con KhachHang
class KhachHang(NguoiDung):
    __mapper_args__ = {
        'polymorphic_identity': VaiTroNguoiDung.KHACH_HANG
    }

# Lớp con QuanTriVien
class QuanTriVien(NguoiDung):
    __mapper_args__ = {
        'polymorphic_identity': VaiTroNguoiDung.QUAN_TRI_VIEN
    }