# app/models/nguoi_dung.py

from datetime import datetime
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
import enum

# Sử dụng Enum để định nghĩa các giá trị vai trò và trạng thái một cách cố định
# Giúp tránh lỗi gõ sai chuỗi và làm code dễ đọc hơn.
class VaiTroNguoiDung(enum.Enum):
    KHACH_HANG = 'khachHang'
    QUAN_TRI_VIEN = 'quanTriVien'

class TrangThaiNguoiDung(enum.Enum):
    KICH_HOAT = 'kích hoạt'
    KHOA = 'khóa'

class NguoiDung(db.Model):
    __tablename__ = 'NGUOIDUNG' # Tên bảng đã được Việt hóa
    
    __mapper_args__ = {
        'polymorphic_identity': 'nguoidung',
        'polymorphic_on': 'vaitro' # Cột dùng để phân biệt các lớp con
    }

    # Giữ nguyên tên cột của bạn, chỉ thay đổi kiểu dữ liệu của mã người dùng
    # Sử dụng Integer và để nó tự động tăng là một thông lệ tốt hơn String(13)
    maNguoiDung = db.Column(db.String(13), primary_key=True)
    hoTen = db.Column(db.String(40), nullable=True)
    soDienThoai = db.Column(db.String(13), unique=True, index=True, nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    tenDangNhap = db.Column(db.String(30), unique=True, nullable=False, index=True)
    
    # CỘT QUAN TRỌNG: Đổi tên thành 'matKhauHash' để thể hiện rõ nó chứa hash, không phải mật khẩu thô
    matKhauHash = db.Column(db.String(256), nullable=False)
    
    # Sử dụng db.Enum để ràng buộc giá trị cho cột 'vaitro' và 'trangthai'
    vaitro = db.Column(db.Enum(VaiTroNguoiDung), nullable=False, default=VaiTroNguoiDung.KHACH_HANG)
    trangthai = db.Column(db.Enum(TrangThaiNguoiDung), default=TrangThaiNguoiDung.KICH_HOAT)
    
    ngayTao = db.Column(db.DateTime, default=datetime.utcnow)
    ngayCapNhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Các mối quan hệ ---
    gioHang = db.relationship('GioHang', back_populates='nguoiDung', uselist=False, cascade="all, delete-orphan")
    cacDonHang = db.relationship('DonHang', back_populates='nguoiDung', lazy='dynamic')
    cacDanhGia = db.relationship('DanhGia', back_populates='nguoiDung', lazy='dynamic')
    cacDiaChi = db.relationship('DiaChi', back_populates='nguoiDung', lazy='dynamic', cascade="all, delete-orphan")

    # --- CÁC PHƯƠNG THỨC XỬ LÝ MẬT KHẨU ---
    def datMatKhau(self, matkhau):
        """Tạo hash từ mật khẩu người dùng cung cấp."""
        self.matKhauHash = generate_password_hash(matkhau)

    def kiemTraMatKhau(self, matkhau):
        """So sánh mật khẩu người dùng nhập với hash đã lưu trong CSDL."""
        return check_password_hash(self.matKhauHash, matkhau)

    def __repr__(self):
        return f'<Người dùng {self.tenDangNhap}>'

# Lớp con cho Khách Hàng
class KhachHang(NguoiDung):
    __mapper_args__ = {
        # Dùng Enum để đảm bảo giá trị luôn nhất quán
        'polymorphic_identity': VaiTroNguoiDung.KHACH_HANG
    }

# Lớp con cho Quản Trị Viên
class QuanTriVien(NguoiDung):
    __mapper_args__ = {
        'polymorphic_identity': VaiTroNguoiDung.QUAN_TRI_VIEN
    }