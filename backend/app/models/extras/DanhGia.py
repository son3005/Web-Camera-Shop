from datetime import datetime
from ...extensions import db
from sqlalchemy import CheckConstraint
from ..enums import TrangThaiDanhGiaEnum
class DanhGia(db.Model):
    """
    Lớp DanhGia đại diện cho bảng 'danh_gia' trong cơ sở dữ liệu, lưu trữ thông tin đánh giá của người dùng cho sản phẩm.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi đánh giá.
        chi_tiet_don_hang_id (int): Khóa ngoại liên kết đến chi tiết đơn hàng, đảm bảo mỗi chi tiết đơn hàng chỉ có một đánh giá.
        san_pham_id (int): Khóa ngoại liên kết đến sản phẩm được đánh giá.
        nguoi_dung_id (int): Khóa ngoại liên kết đến người dùng thực hiện đánh giá.
        diem_danh_gia (int): Điểm đánh giá (từ 1 đến 5), có ràng buộc kiểm tra giá trị hợp lệ.
        binh_luan (str): Nội dung bình luận của người dùng (có thể để trống).
        trang_thai (TrangThaiDanhGiaEnum): Trạng thái của đánh giá (ví dụ: đã duyệt, chờ duyệt).
        ngay_tao (datetime): Thời điểm tạo đánh giá.
        ngay_cap_nhat (datetime): Thời điểm cập nhật đánh giá gần nhất.

    Ràng buộc:
        - Điểm đánh giá phải nằm trong khoảng từ 1 đến 5.
        - Mỗi người dùng chỉ được đánh giá một lần cho mỗi sản phẩm.
        - Mỗi chi tiết đơn hàng chỉ có một đánh giá.

    Quan hệ:
        - nguoi_dung: Tham chiếu đến đối tượng Người Dùng đã thực hiện đánh giá.
        - san_pham: Tham chiếu đến đối tượng Sản Phẩm được đánh giá.
        - chi_tiet_don_hang: Tham chiếu đến đối tượng Chi Tiết Đơn Hàng liên quan đến đánh giá.
        
    Phương thức:
        __repr__: Trả về chuỗi biểu diễn đối tượng đánh giá, hiển thị ID đánh giá và ID sản phẩm liên quan.
    """
    __tablename__ = 'danh_gia'

    # -- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    chi_tiet_don_hang_id = db.Column(db.Integer, db.ForeignKey('chi_tiet_don_hang.id'), nullable=False, unique=True)
    san_pham_id = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False, index=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, index=True)
    diem_danh_gia = db.Column(db.Integer, nullable=False)
    binh_luan = db.Column(db.Text, nullable=True)
    trang_thai = db.Column(db.Enum(TrangThaiDanhGiaEnum), default=TrangThaiDanhGiaEnum.DA_DUYET, nullable=False)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    #-- Ràng buộc kiểm tra ---
    __table_args__ = (
        CheckConstraint('diem_danh_gia >= 1 AND diem_danh_gia <= 5', name='check_diem_danh_gia_range'),
        db.Index('idx_trang_thai_danhgia', 'trang_thai'),
        db.UniqueConstraint('san_pham_id', 'nguoi_dung_id', name='uq_user_sanpham_danhgia'), 
    )
   

    # --- Các mối quan hệ (Relationships) ---
    nguoi_dung = db.relationship('NguoiDung', back_populates='danh_gias')
    san_pham = db.relationship('SanPham') 
    chi_tiet_don_hang = db.relationship('ChiTietDonHang')

    def __repr__(self):
        return f'<Đánh giá {self.id} cho Sản phẩm ID {self.san_pham_id}>'