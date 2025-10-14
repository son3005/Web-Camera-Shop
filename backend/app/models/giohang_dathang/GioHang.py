# app/models/gio_hang.py

from app.extensions import db

class GioHang(db.Model):
    __tablename__ = 'gio_hang'

    id = db.Column(db.Integer, primary_key=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, unique=True)

    # --- Mối quan hệ ---
    nguoi_dung = db.relationship('NguoiDung', back_populates='gio_hang')
    items = db.relationship('ChiTietGioHang', back_populates='gio_hang', cascade="all, delete-orphan", lazy='dynamic')

    def __repr__(self):
        return f'<Giỏ hàng của Người dùng ID {self.nguoi_dung_id}>'