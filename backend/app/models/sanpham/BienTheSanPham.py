# [file name]: BienTheSanPham.py
from sqlalchemy import CheckConstraint, ForeignKey, Index
from ...extensions import db
from ..enums import TrangThaiSanPhamEnum

class BienTheSanPham(db.Model):
    """
    Biến thể sản phẩm
    """
    __tablename__ = 'bien_the_san_pham'

    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True) 
    san_pham_id = db.Column(db.Integer, ForeignKey('san_pham.id'), nullable=False, index=True)
    ten_bien_the = db.Column(db.String(100), nullable=False)
    trang_thai_kich_hoat = db.Column(db.Enum(TrangThaiSanPhamEnum), default=TrangThaiSanPhamEnum.DANG_BAN, nullable=False)
    gia_ban = db.Column(db.Numeric(12, 2), nullable=False)
    mau = db.Column(db.String(20), nullable=True)
    so_luong = db.Column(db.Integer, nullable=False, default=0)
    
    # --- Mối quan hệ ---
    san_pham = db.relationship('SanPham', back_populates='cac_bien_the')
    hinh_anhs = db.relationship('HinhAnhSanPham', back_populates='bien_the', cascade="all, delete-orphan")
    chi_tiet_gio_hangs = db.relationship('ChiTietGioHang', back_populates='bien_the_san_pham')
    chi_tiet_don_hangs = db.relationship('ChiTietDonHang', back_populates='bien_the_san_pham')
    chi_tiet_phieu_thus = db.relationship('ChiTietPhieuThu', back_populates='bien_the_san_pham')

    #-- Ràng buộc kiểm tra ---
    __table_args__ = (
        Index('idx_trang_thai', 'trang_thai_kich_hoat'),
        CheckConstraint('gia_ban > 0', name='check_gia_positive'),
        CheckConstraint('so_luong >= 0', name='check_so_luong_positive')
    )

    def __repr__(self):
        return f'<Sản phẩm ID {self.san_pham_id} - Tên: {self.ten_bien_the}>'