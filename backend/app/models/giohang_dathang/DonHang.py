from datetime import datetime
from app.extensions import db
import enum

# Enum cho các trạng thái của đơn hàng
class TrangThaiDonHang(enum.Enum):
    CHO_THANH_TOAN = "Chờ thanh toán"
    DA_THANH_TOAN = "Đã thanh toán"
    DANG_GIAO_HANG = "Đang giao hàng"
    HOAN_THANH = "Hoàn thành"
    DA_HUY = "Đã hủy"

class DonHang(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'don_hang'

    id = db.Column(db.Integer, primary_key=True)
    ma_don_hang = db.Column(db.String(50), unique=True, nullable=False)
    
    # Khóa ngoại, liên kết tới bảng 'nguoi_dung'
    ma_nguoi_dung = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False)
    
    trang_thai = db.Column(db.Enum(TrangThaiDonHang), default=TrangThaiDonHang.CHO_THANH_TOAN, nullable=False)
    tong_tien = db.Column(db.Float, nullable=False)

    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Các mối quan hệ (Relationships) ---
    
    # Mỗi đơn hàng thuộc về một người dùng.
    # 'NguoiDung' là tên class Người Dùng.
    # 'cac_don_hang' là tên thuộc tính trong class NguoiDung để gọi lại.
    nguoi_dung = db.relationship('NguoiDung', back_populates='cac_don_hang')
    
    # Một đơn hàng có nhiều mục (sản phẩm).
    # 'MucDonHang' là tên class chứa các mục trong đơn hàng.
    # 'don_hang' là tên thuộc tính trong class MucDonHang để gọi lại.
    cac_muc = db.relationship('MucDonHang', back_populates='don_hang', cascade="all, delete-orphan")

    # Một đơn hàng có một giao dịch thanh toán.
    # 'ThanhToan' là tên class Thanh Toán.
    # 'don_hang' là tên thuộc tính trong class ThanhToan để gọi lại.
    thanh_toan = db.relationship('ThanhToan', back_populates='don_hang', uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Đơn hàng {self.ma_don_hang}>'