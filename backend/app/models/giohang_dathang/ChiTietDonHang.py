    # app/models/chi_tiet_don_hang.py

from ...extensions import db
    
class ChiTietDonHang(db.Model):
    """
    Mô hình ChiTietDonHang đại diện cho chi tiết của từng sản phẩm trong một đơn hàng.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi chi tiết đơn hàng.
        don_hang_id (int): Khóa ngoại liên kết đến bảng đơn hàng (DonHang).
        bien_the_san_pham_id (int, tùy chọn): Khóa ngoại liên kết đến bảng biến thể sản phẩm (BienTheSanPham).
        ten_san_pham_luc_mua (str): Tên sản phẩm tại thời điểm đặt hàng.
        ten_bien_the_luc_mua (str, tùy chọn): Tên biến thể sản phẩm tại thời điểm đặt hàng.
        don_gia_luc_mua (Decimal): Đơn giá của sản phẩm tại thời điểm đặt hàng.
        so_luong (int): Số lượng sản phẩm trong đơn hàng (mặc định là 1, phải lớn hơn 0).

    Mối quan hệ:
        don_hang (DonHang): Đơn hàng chứa chi tiết này.
        bien_the_san_pham (BienTheSanPham): Biến thể sản phẩm liên quan (nếu có).
        danh_gia (DanhGia): Đánh giá liên quan đến chi tiết đơn hàng này (nếu có).

    Ràng buộc:
        - so_luong phải lớn hơn 0.
        - don_gia_luc_mua phải lớn hơn hoặc bằng 0.
        
    Phương thức:
        __repr__: Trả về chuỗi biểu diễn đối tượng chi tiết đơn hàng.
    """
    __tablename__ = 'chi_tiet_don_hang'

    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    don_hang_id = db.Column(db.Integer, db.ForeignKey('don_hang.id'), nullable=False, index=True)
    bien_the_san_pham_id = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=True, index=True) 
    ten_san_pham_luc_mua = db.Column(db.String(255), nullable=False)
    don_gia_luc_mua = db.Column(db.Numeric(12), nullable=False)
    so_luong = db.Column(db.Integer, nullable=False, server_default="1")
    
    # --- Mối quan hệ ---
    don_hang = db.relationship('DonHang', back_populates='items')
    bien_the_san_pham = db.relationship('BienTheSanPham') 
    danh_gia = db.relationship('DanhGia', back_populates='chi_tiet_don_hang', uselist=False, cascade='all, delete-orphan')

    #--- Ràng buộc ---
    __table_args__ = (
        db.CheckConstraint('so_luong > 0', name='ck_ctdh_so_luong'),
        db.CheckConstraint('don_gia_luc_mua >= 0', name='ck_dongia_positive'),
    )
    def __repr__(self):
        return f'<Chi tiết Đơn hàng {self.id}: {self.so_luong} x {self.ten_san_pham_luc_mua}>'