# app/models/thanh_toan.py

from datetime import datetime
from ...extensions import db
from ..enums import TrangThaiThanhToanEnum, PhuongThucThanhToanEnum

class ThanhToan(db.Model):
    __tablename__ = 'thanh_toan'
    
    id = db.Column(db.Integer, primary_key=True)
    don_hang_id = db.Column(db.Integer, db.ForeignKey('don_hang.id'), nullable=False, unique=True)
    so_tien = db.Column(db.Numeric(14, 2), nullable=False)
    phuong_thuc = db.Column(db.Enum(PhuongThucThanhToanEnum),default= PhuongThucThanhToanEnum.COD, nullable=False)
    trang_thai = db.Column(db.Enum(TrangThaiThanhToanEnum), default=TrangThaiThanhToanEnum.CHO_THANH_TOAN, nullable=False)
    ma_giao_dich_ben_thu_3 = db.Column(db.String(255), nullable=True, index=True)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Mối quan hệ ---
    don_hang = db.relationship('DonHang', back_populates='thanh_toan')

    #--- Ràng buộc ---
    __table_args__ = (
        db.CheckConstraint('so_tien >= 0', name='ck_thanhtoan_so_tien'), 
    )

    def __repr__(self):
        return f'<Thanh toán cho Đơn hàng ID {self.don_hang_id} - {self.trang_thai.value}>'