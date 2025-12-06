# app/models/gio_hang.py

from ...extensions import db

class GioHang(db.Model):
    """
    Lớp GioHang đại diện cho bảng 'gio_hang' trong cơ sở dữ liệu, lưu trữ thông tin giỏ hàng của từng người dùng.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi giỏ hàng.
        nguoi_dung_id (int): Khóa ngoại liên kết đến bảng 'nguoi_dung', xác định chủ sở hữu của giỏ hàng. Đảm bảo mỗi người dùng chỉ có một giỏ hàng (unique).
        nguoi_dung (NguoiDung): Quan hệ ORM đến đối tượng Người Dùng sở hữu giỏ hàng này.
        items (Danh sách ChiTietGioHang): Danh sách các mục (sản phẩm) trong giỏ hàng, liên kết qua bảng 'chi_tiet_gio_hang'. Khi xóa giỏ hàng, các mục này cũng bị xóa theo (cascade).

    Phương thức:
        __repr__(): Trả về chuỗi biểu diễn đối tượng, hiển thị ID người dùng sở hữu giỏ hàng.
    """
    __tablename__ = 'gio_hang'

    id = db.Column(db.Integer, primary_key=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, unique=True)

    # --- Mối quan hệ ---
    nguoi_dung = db.relationship('NguoiDung', back_populates='gio_hang')
    items = db.relationship('ChiTietGioHang', back_populates='gio_hang', cascade="all, delete-orphan", lazy='dynamic')

    def __repr__(self):
        return f'<Giỏ hàng của Người dùng ID {self.nguoi_dung_id}>'