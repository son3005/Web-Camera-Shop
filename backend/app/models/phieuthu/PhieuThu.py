from ...extensions import db
from datetime import datetime

class PhieuThu(db.Model):
    __tablename__ = 'phieu_thu'

    id = db.Column(db.Integer, primary_key=True)
    nguoi_nhap_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=True, index=True)
    ma_phieu_thu = db.Column(db.String(25), index=True)
    ten_nha_cung_cap = db.Column(db.String(100), nullable=False)
    ngay_thu = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Sửa: Đảm bảo tên relationship khớp với ChiTietPhieuThu
    chi_tiet_phieu_thus = db.relationship('ChiTietPhieuThu', back_populates='phieu_thu', cascade="all, delete-orphan")
    nguoi_dung = db.relationship('NguoiDung', back_populates='phieu_thus')

    def __repr__(self):
        return f'<Phiếu thu {self.ma_phieu_thu}>'