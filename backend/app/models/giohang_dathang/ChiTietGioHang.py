# app/models/muc_gio_hang.py

from datetime import datetime
from ...extensions import db

class ChiTietGioHang(db.Model):
    """
    Mô hình ChiTietGioHang đại diện cho chi tiết từng mục trong giỏ hàng của người dùng.
    
    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi mục giỏ hàng.
        gio_hang_id (int): Khóa ngoại liên kết đến bảng 'gio_hang', xác định giỏ hàng chứa mục này.
        bien_the_san_pham_id (int): Khóa ngoại liên kết đến bảng 'bien_the_san_pham', xác định biến thể sản phẩm được thêm vào giỏ.
        so_luong (int): Số lượng sản phẩm của biến thể này trong giỏ hàng, mặc định là 1, không nhỏ hơn 1.
        ngay_them (datetime): Thời điểm thêm mục này vào giỏ hàng, mặc định là thời gian hiện tại.

    Mối quan hệ:
        gio_hang: Tham chiếu đến đối tượng GioHang chứa mục này.
        bien_the_san_pham: Tham chiếu đến đối tượng BienTheSanPham tương ứng.

    Ràng buộc:
        - Một biến thể sản phẩm chỉ xuất hiện một lần trong cùng một giỏ hàng (UniqueConstraint).
        - Số lượng sản phẩm phải lớn hơn hoặc bằng 1 (CheckConstraint).
        - Tạo chỉ mục cho cặp (gio_hang_id, bien_the_san_pham_id) để tối ưu truy vấn.
        
    Phương thức:
        __repr__: Trả về chuỗi biểu diễn đối tượng, hiển thị id, số lượng và id biến thể sản phẩm.
    """
    __tablename__ = 'chi_tiet_gio_hang'

    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    gio_hang_id = db.Column(db.Integer, db.ForeignKey('gio_hang.id'), nullable=False, index=True)
    bien_the_san_pham_id = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=False, index=True)
    so_luong = db.Column(db.Integer, nullable=False, default=1)
    ngay_them = db.Column(db.DateTime, server_default=db.func.now())
    # --- Mối quan hệ ---
    gio_hang = db.relationship('GioHang', back_populates='items')
    bien_the_san_pham = db.relationship('BienTheSanPham', back_populates='chi_tiet_gio_hangs', lazy='joined')

    #-- Ràng buộc ---
    __table_args__ = (
        db.UniqueConstraint('gio_hang_id', 'bien_the_san_pham_id', name='uq_giohang_bienthe'),
        db.CheckConstraint('so_luong >= 1', name='ck_so_luong_positive'),
        db.Index('ix_giohang_bienthe', 'gio_hang_id', 'bien_the_san_pham_id'),
    )
    
    
    def __repr__(self):
        return f'<Mục giỏ hàng {self.id}: {self.so_luong} x Biến thể ID {self.bien_the_san_pham_id}>'