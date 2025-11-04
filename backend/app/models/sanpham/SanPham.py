from datetime import datetime
from sqlalchemy import event, select, func, Index
from ...extensions import db
from ...models.sanpham.DanhMuc import DanhMuc
from ...models.sanpham.ThuongHieu import ThuongHieu
from ..enums import TrangThaiSanPhamEnum
class SanPham(db.Model):
    """
    SanPham là một lớp đại diện cho sản phẩm trong hệ thống.
    Attributes:
        id (int): ID duy nhất của sản phẩm.
        ma_san_pham (str): Mã sản phẩm duy nhất, tối đa 24 ký tự.
        danh_muc_id (int): ID của danh mục mà sản phẩm thuộc về.
        thuong_hieu_id (int): ID của thương hiệu mà sản phẩm thuộc về.
        ten_san_pham (str): Tên của sản phẩm, tối đa 200 ký tự.
        mo_ta (str): Mô tả chi tiết về sản phẩm.
        thong_so_ky_thuat (dict): Thông số kỹ thuật của sản phẩm dưới dạng JSON.
        trang_thai (TrangThaiSanPhamEnum): Trạng thái của sản phẩm (ví dụ: Đang bán, Hết hàng, ...).
        ngay_tao (datetime): Thời điểm sản phẩm được tạo.
        ngay_cap_nhat (datetime): Thời điểm sản phẩm được cập nhật lần cuối.
    Relationships:
        danh_muc (DanhMuc): Mối quan hệ với danh mục chứa sản phẩm.
        thuong_hieu (ThuongHieu): Mối quan hệ với thương hiệu của sản phẩm.
        cac_bien_the (list[BienTheSanPham]): Danh sách các biến thể của sản phẩm.
        danh_gias (list[DanhGia]): Danh sách các đánh giá liên quan đến sản phẩm.
    Table Indexes:
        idx_sanpham_fts: Chỉ mục FULLTEXT trên các cột 'ten_san_pham' và 'mo_ta' để hỗ trợ tìm kiếm văn bản.
    Methods:
        __repr__: Trả về chuỗi đại diện của sản phẩm.
    __tablename__ = 'san_pham'
    """
    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    ma_san_pham = db.Column(db.String(24), unique=True, nullable=False, index=True)
    danh_muc_id = db.Column(db.Integer, db.ForeignKey('danh_muc.id'), nullable=False, index=True)
    thuong_hieu_id = db.Column(db.Integer, db.ForeignKey('thuong_hieu.id'), nullable=False, index=True)
    cap_do_id = db.Column(db.Integer,db.ForeignKey("cap_do.id"),nullable=False,index=True)
    ten_san_pham = db.Column(db.String(200), nullable=False, index=True)
    mau_sac = db.Column(db.String(50), nullable=True)
    mo_ta = db.Column(db.Text, nullable=True)
    thong_so_ky_thuat = db.Column(db.JSON, nullable=True)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Mối quan hệ ---
    danh_muc = db.relationship('DanhMuc', back_populates='san_phams')
    cap_do = db.relationship('CapDo', back_populates='san_phams')
    thuong_hieu = db.relationship('ThuongHieu', back_populates='san_phams')
    cac_bien_the = db.relationship('BienTheSanPham', back_populates='san_pham', cascade="all, delete-orphan")
    danh_gias = db.relationship('DanhGia', back_populates='san_pham', lazy='dynamic')
    
    def __repr__(self):
        return f'<Sản phẩm {self.ten_san_pham}>'
    
    #-- FULLTEXT Index ---
    __table_args__ = (
        db.Index(
            'idx_sanpham_fts',
            'ten_san_pham',
            'mo_ta',
            mysql_prefix='FULLTEXT',
            mysql_with_parser='ngram'
        ),
    )