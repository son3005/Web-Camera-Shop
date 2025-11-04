from datetime import datetime
from sqlalchemy import event, select, func, Index
from ...extensions import db
from ...models.sanpham.DanhMuc import DanhMuc
from ...models.sanpham.ThuongHieu import ThuongHieu
from ..enums import TrangThaiSanPhamEnum
class SanPham(db.Model):
    """
    Lớp SanPham đại diện cho sản phẩm trong hệ thống.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi sản phẩm.
        ma_san_pham (str): Mã sản phẩm, duy nhất và không được để trống.
        danh_muc_id (int): Khóa ngoại liên kết đến bảng DanhMuc.
        thuong_hieu_id (int): Khóa ngoại liên kết đến bảng ThuongHieu.
        cap_do_id (int): Khóa ngoại liên kết đến bảng CapDo.
        ten_san_pham (str): Tên sản phẩm, không được để trống.
        mo_ta (str): Mô tả chi tiết về sản phẩm (có thể để trống).
        thong_so_ky_thuat (dict): Thông số kỹ thuật của sản phẩm (có thể để trống).
        ngay_tao (datetime): Ngày tạo sản phẩm.
        ngay_cap_nhat (datetime): Ngày cập nhật sản phẩm gần nhất.

    Mối quan hệ:
        danh_muc (DanhMuc): Đối tượng danh mục liên kết.
        cap_do (CapDo): Đối tượng cấp độ liên kết.
        thuong_hieu (ThuongHieu): Đối tượng thương hiệu liên kết.
        cac_bien_the (list[BienTheSanPham]): Danh sách các biến thể của sản phẩm.
        danh_gias (DanhGia): Danh sách đánh giá liên quan đến sản phẩm.
        
    Chỉ mục:
        idx_sanpham_fts: Chỉ mục FULLTEXT cho các trường 'ten_san_pham' và 'mo_ta' sử dụng parser 'ngram' (MySQL).
    """
    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    ma_san_pham = db.Column(db.String(24), unique=True, nullable=False, index=True)
    danh_muc_id = db.Column(db.Integer, db.ForeignKey('danh_muc.id'), nullable=False, index=True)
    thuong_hieu_id = db.Column(db.Integer, db.ForeignKey('thuong_hieu.id'), nullable=False, index=True)
    cap_do_id = db.Column(db.Integer,db.ForeignKey("cap_do.id"),nullable=False,index=True)
    ten_san_pham = db.Column(db.String(200), nullable=False, index=True)
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