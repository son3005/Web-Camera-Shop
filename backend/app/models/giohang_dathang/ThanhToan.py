from datetime import datetime
from app.extensions import db
import enum

# Enum cho các phương thức thanh toán
class PhuongThucThanhToan(enum.Enum):
    TIEN_MAT = "Tiền mặt"
    VI_DIEN_TU = "Ví điện tử"

# Enum cho các trạng thái thanh toán
class TrangThaiThanhToan(enum.Enum):
    CHUA_THANH_TOAN = "Chưa thanh toán"
    DA_THANH_TOAN = "Đã thanh toán"
    THAT_BAI = "Thất bại"

class ThanhToan(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'thanh_toan'

    id = db.Column(db.Integer, primary_key=True)
    
    # Khóa ngoại, liên kết tới bảng 'don_hang'
    ma_don_hang = db.Column(db.Integer, db.ForeignKey('don_hang.id'), nullable=False, unique=True)
    
    so_tien = db.Column(db.Float, nullable=False)
    phuong_thuc = db.Column(db.Enum(PhuongThucThanhToan), nullable=False)
    trang_thai = db.Column(db.Enum(TrangThaiThanhToan), default=TrangThaiThanhToan.CHUA_THANH_TOAN, nullable=False)
    
    # ID giao dịch từ bên thứ ba (ví điện tử, cổng thanh toán)
    ma_giao_dich = db.Column(db.String(200), nullable=True)

    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Mối quan hệ (Relationship) ---
    
    # Mỗi thanh toán thuộc về một đơn hàng.
    # 'DonHang' là tên class Đơn Hàng.
    # 'thanh_toan' là tên thuộc tính trong class DonHang để gọi lại.
    don_hang = db.relationship('DonHang', back_populates='thanh_toan')

    def __repr__(self):
        return f'<Thanh toán cho Đơn hàng ID {self.ma_don_hang}>'