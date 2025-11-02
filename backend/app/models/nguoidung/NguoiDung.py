from datetime import datetime
from ...extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
import enum
import uuid
from  ..enums import VaiTroNguoiDungEnum, TrangThaiNguoiDungEnum

# --- MODEL CHÍNH ---
class NguoiDung(db.Model):

    __tablename__ = 'nguoi_dung'
    
    # --- Các thuộc tính ---
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

    # --- QUAN HỆ ---
    gio_hang = db.relationship('GioHang', back_populates='nguoi_dung', uselist=False, cascade="all, delete-orphan")
    don_hangs = db.relationship('DonHang', back_populates='nguoi_dung', lazy='dynamic')
    danh_gias = db.relationship('DanhGia', back_populates='nguoi_dung', lazy='dynamic')
    dia_chis = db.relationship('DiaChi', back_populates='nguoi_dung', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<NguoiDung {self.email} ({self.vai_tro.value})>'


# --- LỚP CON KHÁCH HÀNG ---
class KhachHang(NguoiDung):
    __mapper_args__ = {
        'polymorphic_identity': VaiTroNguoiDungEnum.KHACH_HANG
    }


# --- LỚP CON QUẢN TRỊ VIÊN ---
class QuanTriVien(NguoiDung):
    __mapper_args__ = {
        'polymorphic_identity': VaiTroNguoiDungEnum.QUAN_TRI_VIEN
    }
