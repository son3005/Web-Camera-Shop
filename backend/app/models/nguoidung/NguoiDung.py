from datetime import datetime
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
import enum
import uuid

# --- ENUMs ---
class VaiTroNguoiDung(enum.Enum):
    KHACH_HANG = 'khach_hang'
    QUAN_TRI_VIEN = 'quan_tri_vien'

class TrangThaiNguoiDung(enum.Enum):
    KICH_HOAT = 'kich_hoat'
    KHOA = 'khoa'

# --- MODEL CHÍNH ---
class NguoiDung(db.Model):
    __tablename__ = 'nguoi_dung'
    
    id = db.Column(db.Integer, primary_key=True)
    ma_nguoi_dung = db.Column(db.String(20), unique=True, nullable=False, index=True)

    ho_ten = db.Column(db.String(100), nullable=True)
    so_dien_thoai = db.Column(db.String(15), unique=True, index=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    mat_khau_hash = db.Column(db.String(256), nullable=False)
    
    vai_tro = db.Column(
        db.Enum(VaiTroNguoiDung),
        nullable=False,
        default=VaiTroNguoiDung.KHACH_HANG
    )
    trang_thai = db.Column(
        db.Enum(TrangThaiNguoiDung),
        default=TrangThaiNguoiDung.KICH_HOAT,
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

    # --- HÀM KHỞI TẠO ---
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not self.ma_nguoi_dung:
            self.ma_nguoi_dung = self._generate_ma()

    def _generate_ma(self):
        """Tạo mã người dùng duy nhất (ND-XXXXXX)."""
        return f"ND-{uuid.uuid4().hex[:8].upper()}"

    # --- XỬ LÝ MẬT KHẨU ---
    def set_password(self, matkhau):
        """Tạo hash từ mật khẩu."""
        self.mat_khau_hash = generate_password_hash(matkhau)

    def check_password(self, matkhau):
        """Kiểm tra mật khẩu với hash đã lưu."""
        return check_password_hash(self.mat_khau_hash, matkhau)

    def __repr__(self):
        return f'<NguoiDung {self.email} ({self.vai_tro.value})>'


# --- LỚP CON KHÁCH HÀNG ---
class KhachHang(NguoiDung):
    __mapper_args__ = {
        'polymorphic_identity': VaiTroNguoiDung.KHACH_HANG
    }


# --- LỚP CON QUẢN TRỊ VIÊN ---
class QuanTriVien(NguoiDung):
    __mapper_args__ = {
        'polymorphic_identity': VaiTroNguoiDung.QUAN_TRI_VIEN
    }
