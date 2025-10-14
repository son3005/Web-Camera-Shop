# app/models/thanh_toan.py

from datetime import datetime
from app.extensions import db
import enum

class TrangThaiThanhToan(enum.Enum):
    CHO_THANH_TOAN = 'cho_thanh_toan'
    DA_THANH_TOAN = 'da_thanh_toan'
    THAT_BAI = 'that_bai'
    DA_HOAN_TIEN = 'da_hoan_tien'

class PhuongThucThanhToan(enum.Enum):
    COD = 'cod' # Trả tiền khi nhận hàng
    CHUYEN_KHOAN = 'chuyen_khoan'
    VNPAY = 'vnpay'
    # Thêm các cổng thanh toán khác ở đây

class ThanhToan(db.Model):
    __tablename__ = 'thanh_toan'
    
    id = db.Column(db.Integer, primary_key=True)
    # Liên kết một-một với Đơn hàng
    don_hang_id = db.Column(db.Integer, db.ForeignKey('don_hang.id'), nullable=False, unique=True)

    so_tien = db.Column(db.Numeric(12, 2), nullable=False)
    phuong_thuc = db.Column(db.Enum(PhuongThucThanhToan), nullable=False)
    trang_thai = db.Column(db.Enum(TrangThaiThanhToan), default=TrangThaiThanhToan.CHO_THANH_TOAN, nullable=False)
    ma_giao_dich_ben_thu_3 = db.Column(db.String(255), nullable=True, index=True)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Mối quan hệ ---
    don_hang = db.relationship('DonHang', back_populates='thanh_toan')

    def __repr__(self):
        return f'<Thanh toán cho Đơn hàng ID {self.don_hang_id} - {self.trang_thai.value}>'