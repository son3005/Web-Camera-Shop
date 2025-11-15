from datetime import datetime
from ...extensions import db
from sqlalchemy import CheckConstraint
from ..enums import TrangThaiDanhGiaEnum

class DanhGia(db.Model):
    """
    Bảng 'danh_gia' lưu thông tin đánh giá của người dùng cho sản phẩm.
    Mỗi đánh giá gắn với một chi tiết đơn hàng cụ thể (tức là 1 sản phẩm trong 1 đơn hàng).

    Thuộc tính:
        id (int): Khóa chính.
        chi_tiet_don_hang_id (int): Khóa ngoại đến chi tiết đơn hàng — mỗi chi tiết chỉ có 1 đánh giá.
        san_pham_id (int): Khóa ngoại đến sản phẩm được đánh giá.
        nguoi_dung_id (int): Khóa ngoại đến người dùng thực hiện đánh giá.
        diem_danh_gia (int): Điểm đánh giá (1–5).
        binh_luan (str): Nội dung bình luận (tùy chọn).
        trang_thai (Enum): Trạng thái đánh giá (đã duyệt, chờ duyệt...).
        ngay_tao (datetime): Thời điểm tạo đánh giá.
        ngay_cap_nhat (datetime): Thời điểm cập nhật đánh giá gần nhất.

    Ràng buộc:
        - Mỗi chi tiết đơn hàng chỉ có một đánh giá.
        - Điểm đánh giá nằm trong khoảng 1–5.
        - Cho phép một người đánh giá nhiều lần nếu họ mua nhiều lần cùng sản phẩm.

    Quan hệ:
        - nguoi_dung: Người thực hiện đánh giá.
        - san_pham: Sản phẩm được đánh giá.
        - chi_tiet_don_hang: Chi tiết đơn hàng liên quan.
    """

    __tablename__ = 'danh_gia'

    # --- Các cột ---
    id = db.Column(db.Integer, primary_key=True)
    chi_tiet_don_hang_id = db.Column(db.Integer, db.ForeignKey('chi_tiet_don_hang.id'), nullable=False, unique=True)
    san_pham_id = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False, index=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, index=True)
    diem_danh_gia = db.Column(db.Integer, nullable=False)
    binh_luan = db.Column(db.Text, nullable=True)
    trang_thai = db.Column(db.Enum(TrangThaiDanhGiaEnum), default=TrangThaiDanhGiaEnum.DA_DUYET, nullable=False)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Ràng buộc và chỉ mục ---
    __table_args__ = (
        CheckConstraint('diem_danh_gia >= 1 AND diem_danh_gia <= 5', name='check_diem_danh_gia_range'),
        db.Index('idx_trang_thai_danhgia', 'trang_thai'),
    )

    # --- Quan hệ ---
    nguoi_dung = db.relationship('NguoiDung', back_populates='danh_gias')
    san_pham = db.relationship('SanPham', back_populates='danh_gias')
    chi_tiet_don_hang_id = db.Column(db.Integer, db.ForeignKey('chi_tiet_don_hang.id'), nullable=False, unique=True)

    def __repr__(self):
        return f'<Đánh giá {self.id} - Sản phẩm {self.san_pham_id} - Người dùng {self.nguoi_dung_id}>'
