# app/models/muc_gio_hang.py

from datetime import datetime
from ...extensions import db

class ChiTietGioHang(db.Model):
    __tablename__ = 'chi_tiet_gio_hang'

    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    gio_hang_id = db.Column(db.Integer, db.ForeignKey('gio_hang.id'), nullable=False, index=True)
    bien_the_san_pham_id = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=False, index=True)
    so_luong = db.Column(db.Integer, nullable=False, default=1)
    ngay_them = db.Column(db.DateTime, default=datetime.utcnow)

    # --- Mối quan hệ ---
    gio_hang = db.relationship('GioHang', back_populates='items')
    bien_the_san_pham = db.relationship('BienTheSanPham')

    #-- Ràng buộc ---
    __table_args__ = (
        db.UniqueConstraint('gio_hang_id', 'bien_the_san_pham_id', name='uq_giohang_bienthe'),
        db.CheckConstraint('so_luong >= 1', name='ck_so_luong_positive'),
        db.Index('ix_giohang_bienthe', 'gio_hang_id', 'bien_the_san_pham_id'),
    )
    
    
    def __repr__(self):
        return f'<Mục giỏ hàng {self.id}: {self.so_luong} x Biến thể ID {self.bien_the_san_pham_id}>'