# app/models/bien_the_san_pham.py
from sqlalchemy import CheckConstraint, ForeignKey, Index
from ...extensions import db
from ..enums import TrangThaiSanPhamEnum

class BienTheSanPham(db.Model):
    """
    BienTheSanPham (Variant of Product) là một class đại diện cho các biến thể của sản phẩm trong hệ thống.
    Attributes:
        id (int): ID duy nhất của biến thể sản phẩm.
        san_pham_id (int): ID của sản phẩm cha mà biến thể này thuộc về.
        ten_bien_the (str): Tên của biến thể sản phẩm (có thể là màu sắc, kích thước, v.v.).
        trang_thai_kich_hoat (TrangThaiSanPhamEnum): Trạng thái kích hoạt của biến thể (mặc định là "Đang bán").
        gia_ban (decimal): Giá bán của biến thể sản phẩm.
        gia_khuyen_mai (decimal, optional): Giá khuyến mãi của biến thể sản phẩm (nếu có).
        ngay_bat_dau_khuyen_mai (datetime, optional): Ngày bắt đầu áp dụng giá khuyến mãi.
        ngay_ket_thuc_khuyen_mai (datetime, optional): Ngày kết thúc áp dụng giá khuyến mãi.
        so_luong_ton (int): Số lượng tồn kho của biến thể sản phẩm (mặc định là 0).
    Relationships:
        san_pham (SanPham): Mối quan hệ với sản phẩm cha (SanPham).
        hinh_anhs (list[HinhAnhSanPham]): Danh sách hình ảnh liên kết với biến thể sản phẩm.
        chi_tiet_gio_hangs (list[ChiTietGioHang]): Danh sách chi tiết giỏ hàng liên kết với biến thể sản phẩm.
        chi_tiet_don_hangs (list[ChiTietDonHang]): Danh sách chi tiết đơn hàng liên kết với biến thể sản phẩm.
    Constraints:
        - Giá bán (gia_ban) phải lớn hơn 0.
        - Số lượng tồn kho (so_luong_ton) phải lớn hơn hoặc bằng 0.
        - Giá khuyến mãi (gia_khuyen_mai) phải lớn hơn 0 và nhỏ hơn giá bán (gia_ban), nếu được cung cấp.
        - Nếu ngày bắt đầu và ngày kết thúc khuyến mãi được cung cấp, ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.
    Methods:
        __repr__(): Trả về chuỗi đại diện cho biến thể sản phẩm, bao gồm ID sản phẩm và tên biến thể.
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