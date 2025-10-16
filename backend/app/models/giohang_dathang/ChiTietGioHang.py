# app/models/muc_gio_hang.py

from datetime import datetime
from app.extensions import db

class ChiTietGioHang(db.Model):
    __tablename__ = 'chi_tiet_gio_hang'

    id = db.Column(db.Integer, primary_key=True)
    gio_hang_id = db.Column(db.Integer, db.ForeignKey('gio_hang.id'), nullable=False, index=True)
    
    # CẢI TIẾN LỚN: Luôn liên kết tới biến thể sản phẩm (SKU cụ thể)
    bien_the_san_pham_id = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=False, index=True)
    
    so_luong = db.Column(db.Integer, nullable=False, default=1)
    ngay_them = db.Column(db.DateTime, default=datetime.utcnow)

    # --- Mối quan hệ ---
    gio_hang = db.relationship('GioHang', back_populates='items')
    bien_the_san_pham = db.relationship('BienTheSanPham') # Thêm relationship này để dễ dàng truy cập thông tin biến thể
    
    
    def __repr__(self):
        return f'<Mục giỏ hàng {self.id}: {self.so_luong} x Biến thể ID {self.bien_the_san_pham_id}>'