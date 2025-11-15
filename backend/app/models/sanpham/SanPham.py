# [file name]: SanPham.py
from datetime import datetime
from sqlalchemy import event, select, func, Index
from ...extensions import db
from ...models.sanpham.DanhMuc import DanhMuc
from ...models.sanpham.ThuongHieu import ThuongHieu
from ..enums import TrangThaiSanPhamEnum

class SanPham(db.Model):
    """
    Lớp SanPham đại diện cho sản phẩm trong hệ thống.
    """
    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    ma_san_pham = db.Column(db.String(24), unique=True, nullable=False, index=True)
    danh_muc_id = db.Column(db.Integer, db.ForeignKey('danh_muc.id'), nullable=False, index=True)
    thuong_hieu_id = db.Column(db.Integer, db.ForeignKey('thuong_hieu.id'), nullable=False, index=True)
    cap_do_id = db.Column(db.Integer, db.ForeignKey("cap_do.id"), nullable=False, index=True)
    ten_san_pham = db.Column(db.String(100), nullable=False, index=True)
    mo_ta = db.Column(db.Text, nullable=True)
    thong_so_ky_thuat = db.Column(db.JSON, nullable=True)
    so_sao_trung_binh = db.Column(db.Numeric(2,1), nullable=True, default=0.0)
    so_luong_danh_gia = db.Column(db.Integer, nullable=False, default=0)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Mối quan hệ ---
    danh_muc = db.relationship('DanhMuc', back_populates='san_phams')
    cap_do = db.relationship('CapDo', back_populates='san_phams')
    thuong_hieu = db.relationship('ThuongHieu', back_populates='san_phams')
    cac_bien_the = db.relationship('BienTheSanPham', back_populates='san_pham', cascade="all, delete-orphan")
    danh_gias = db.relationship('DanhGia', back_populates='san_pham', lazy='dynamic')
    
    #-- FULLTEXT Index ---
    __table_args__ = (
    db.Index(
        'idx_sanpham_fts',
        'ten_san_pham',
        'mo_ta',
        mysql_prefix='FULLTEXT',
        mysql_with_parser='ngram'
    ),
    db.Index('idx_ten_san_pham_like', 'ten_san_pham')
)

    def __repr__(self):
        return f'<Sản phẩm {self.ten_san_pham}>'