# app/models/bien_the_san_pham.py
from sqlalchemy import CheckConstraint, ForeignKey, Index
from ...extensions import db
from ..enums import TrangThaiSanPhamEnum

class BienTheSanPham(db.Model):
    """
    Lớp BienTheSanPham đại diện cho một biến thể cụ thể của sản phẩm trong hệ thống quản lý cửa hàng camera.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi biến thể sản phẩm.
        san_pham_id (int): Khóa ngoại liên kết đến bảng 'san_pham', xác định sản phẩm gốc của biến thể.
        ten_bien_the (str): Tên của biến thể sản phẩm (ví dụ: màu sắc, phiên bản...).
        trang_thai_kich_hoat (TrangThaiSanPhamEnum): Trạng thái hoạt động của biến thể (đang bán, ngừng bán...).
        gia_ban (Decimal): Giá bán của biến thể sản phẩm, phải lớn hơn 0.
        mau (str, tùy chọn): Màu sắc của biến thể sản phẩm.
        so_luong (int): Số lượng tồn kho của biến thể, không được âm.

    Quan hệ:
        san_pham: Tham chiếu đến đối tượng SanPham mà biến thể này thuộc về.
        hinh_anhs: Danh sách các hình ảnh liên quan đến biến thể sản phẩm.
        chi_tiet_gio_hangs: Danh sách các chi tiết giỏ hàng liên quan đến biến thể sản phẩm.
        chi_tiet_don_hangs: Danh sách các chi tiết đơn hàng liên quan đến biến thể sản phẩm.
        chi_tiet_phieu_thus: Danh sách các chi tiết phiếu thu liên quan đến biến thể sản phẩm.

    Ràng buộc:
        - Giá bán phải lớn hơn 0.
        - Số lượng phải lớn hơn hoặc bằng 0.
        - Có chỉ mục cho trường trạng thái kích hoạt để tối ưu truy vấn.
        
    Phương thức:
        __repr__: Trả về chuỗi biểu diễn đối tượng, hiển thị ID sản phẩm và tên biến thể.
    """
    __tablename__ = 'bien_the_san_pham'

    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True) 
    san_pham_id = db.Column(db.Integer, ForeignKey('san_pham.id'), nullable=False, index=True)
    ten_bien_the = db.Column(db.String(100), nullable=False)
    trang_thai_kich_hoat = db.Column(db.Enum(TrangThaiSanPhamEnum), default=TrangThaiSanPhamEnum.DANG_BAN, nullable=False)
    gia_ban = db.Column(db.Numeric(12, 2), nullable=False)
    mau = db.Column(db.String(20),nullable=True)
    so_luong = db.Column(db.Integer, nullable=False, default=0)
    
    # --- Mối quan hệ ---
    san_pham = db.relationship('SanPham', back_populates='cac_bien_the')
    hinh_anhs = db.relationship('HinhAnhSanPham', back_populates='bien_the', cascade="all, delete-orphan")
    chi_tiet_gio_hangs = db.relationship('ChiTietGioHang', back_populates='bien_the_san_pham')
    chi_tiet_don_hangs = db.relationship('ChiTietDonHang', back_populates='bien_the_san_pham')
    chi_tiet_phieu_thus = db.relationship('ChiTietPhieuThu', back_populates='bien_the_san_pham')


    #-- Ràng buộc kiểm tra ---
    __table_args__ = (
        db.Index('idx_trang_thai', 'trang_thai_kich_hoat'),
        db.CheckConstraint('gia_ban > 0', name='check_gia_positive'),
        db.CheckConstraint('so_luong >= 0', name='check_so_luong_positive')
    )

    def __repr__(self):
        return f'<Sản phẩm ID {self.san_pham_id} - Tên: {self.ten_bien_the}>'