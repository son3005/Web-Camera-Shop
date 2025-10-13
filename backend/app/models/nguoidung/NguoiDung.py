from datetime import datetime
from app.extensions import db

class NguoiDung(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'nguoi_dung'
    
    # Cấu hình cho Kế thừa Bảng Đơn (Single Table Inheritance)
    __mapper_args__ = {
        # Định danh cho lớp cơ sở
        'polymorphic_identity': 'nguoi_dung',
        
        # Sử dụng cột 'vai_tro' để phân biệt các lớp con
        'polymorphic_on': 'vai_tro'
    }

    # Các cột chung cho tất cả người dùng
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    ten_dang_nhap = db.Column(db.String(80), unique=True, nullable=False, index=True)
    mat_khau_bam = db.Column(db.String(256), nullable=False) # "password_hash"
    vai_tro = db.Column(db.String(20), nullable=False) # "role"
    
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Các mối quan hệ chung ---
    
    # Mỗi người dùng (khách hàng) có một giỏ hàng
    gio_hang = db.relationship('GioHang', back_populates='nguoi_dung', uselist=False, cascade="all, delete-orphan")
    
    # Mỗi người dùng có thể có nhiều đơn hàng
    cac_don_hang = db.relationship('DonHang', back_populates='nguoi_dung', lazy='dynamic')
    
    # Mỗi người dùng có thể có nhiều đánh giá
    cac_danh_gia = db.relationship('DanhGia', back_populates='nguoi_dung', lazy='dynamic')
    
    # Mỗi người dùng có thể có nhiều địa chỉ
    cac_dia_chi = db.relationship('DiaChi', back_populates='nguoi_dung', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Người dùng {self.ten_dang_nhap}>'

# Lớp con cho Khách Hàng
class KhachHang(NguoiDung):
    __mapper_args__ = {
        # Giá trị của cột 'vai_tro' cho lớp này sẽ là 'khach_hang'
        'polymorphic_identity': 'khach_hang'
    }
    # Không cần định nghĩa lại các cột chung, chúng được kế thừa từ NguoiDung.
    # Có thể thêm các cột riêng cho KhachHang nếu cần.

# Lớp con cho Quản Trị Viên
class QuanTriVien(NguoiDung):
    __mapper_args__ = {
        # Giá trị của cột 'vai_tro' cho lớp này sẽ là 'quan_tri_vien'
        'polymorphic_identity': 'quan_tri_vien'
    }
    # Tương tự, kế thừa tất cả các cột từ NguoiDung.