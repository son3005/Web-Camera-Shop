from sqlalchemy import event
from ...extensions import db
from ...services.cloudinary_service import delete_image_task

class ThuongHieu(db.Model):
    """
    Lớp ThuongHieu đại diện cho bảng 'thuong_hieu' trong cơ sở dữ liệu, lưu trữ thông tin về các thương hiệu sản phẩm.

    Thuộc tính:
        id (int): Khóa chính, tự động tăng.
        ma_thuong_hieu (str): Mã thương hiệu, duy nhất, không được để trống, tối đa 5 ký tự.
        ten_thuong_hieu (str): Tên thương hiệu, duy nhất, không được để trống, tối đa 100 ký tự.
        logo_url (str, optional): Đường dẫn tới logo của thương hiệu, có thể để trống, tối đa 512 ký tự.
        public_id (str, optional): Mã định danh công khai, duy nhất, có thể để trống, tối đa 255 ký tự.

    Quan hệ:
        san_phams (relationship): Danh sách các sản phẩm thuộc thương hiệu này (liên kết với lớp SanPham).

    Phương thức:
        __repr__(): Trả về chuỗi đại diện cho đối tượng thương hiệu.
    """
    __tablename__ = 'thuong_hieu'

    id = db.Column(db.Integer, primary_key=True)
    ma_thuong_hieu = db.Column(db.String(5), unique=True, nullable=False, index=True)
    ten_thuong_hieu = db.Column(db.String(100), unique=True, nullable=False)
    logo_url = db.Column(db.String(512), nullable=True)
    public_id = db.Column(db.String(255), nullable=True, unique=True, index=True)

    # --- Mối quan hệ ---
    san_phams = db.relationship('SanPham', back_populates='thuong_hieu', lazy='dynamic')
    def __repr__(self):
        return f'<Thương hiệu {self.ten_thuong_hieu}>'
    