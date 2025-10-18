# app/models/bien_the_san_pham.py
from sqlalchemy import CheckConstraint, ForeignKey
from app.extensions import db

class BienTheSanPham(db.Model):
    __tablename__ = 'bien_the_san_pham'

    id = db.Column(db.Integer, primary_key=True)
    
    # (CẢI TIẾN) Đổi tên cột cho nhất quán
    san_pham_id = db.Column(db.Integer, ForeignKey('san_pham.id'), nullable=False, index=True)    
    
    ma_sku = db.Column(db.String(120), unique=True, nullable=False, index=True)
    ten_bien_the = db.Column(db.String(100), nullable=True)
    gia = db.Column(db.Numeric(12, 2), nullable=False)
    gia_khuyen_mai = db.Column(db.Numeric(12, 2), nullable=True)
    gia_nhap_vao = db.Column(db.Numeric(12, 2), nullable=True) # Giữ lại cột này, rất tốt cho thống kê
    so_luong_ton = db.Column(db.Integer, nullable=False, default=0)
    
    # --- Mối quan hệ ---
    
    # (CẢI TIẾN) Đổi tên relationship cho khớp với SanPham.cac_bien_the
    san_pham = db.relationship('SanPham', back_populates='cac_bien_the')
    
    hinh_anhs = db.relationship('HinhAnhSanPham', back_populates='bien_the', cascade="all, delete-orphan")
    chi_tiet_gio_hangs = db.relationship('ChiTietGioHang', back_populates='bien_the_san_pham')
    chi_tiet_don_hangs = db.relationship('ChiTietDonHang', back_populates='bien_the_san_pham')
    
    # (RẤT TỐT) Giữ nguyên các CheckConstraint này, chúng hoàn hảo cho an toàn dữ liệu
    __table_args__ = (
        CheckConstraint('gia > 0', name='check_gia_positive'),
        CheckConstraint('so_luong_ton >= 0', name='check_so_luong_ton_non_negative'),
        CheckConstraint('gia_khuyen_mai IS NULL OR (gia_khuyen_mai > 0 AND gia_khuyen_mai < gia)', name='check_gia_khuyen_mai_valid'),
    )

    def __repr__(self):
        # (CẢI TIẾN) Cập nhật repr
        return f'<Biến thể SKU {self.ma_sku} - Sản phẩm ID {self.san_pham_id} - Tên: {self.ten_bien_the}>'