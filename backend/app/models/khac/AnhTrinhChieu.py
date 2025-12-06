from ..enums import TrangThaiAnhTrinhChieuEnum
from ...extensions import db


class AnhTrinhChieu(db.Model):
    """
    Lớp Banner đại diện cho bảng 'banner' trong cơ sở dữ liệu, lưu trữ thông tin về các banner quảng cáo.

    Thuộc tính:
        id (int): Khóa chính, tự động tăng.
        tieu_de (str): Tiêu đề của banner, tối đa 200 ký tự.
        hinh_anh_url (str): URL hình ảnh của banner, tối đa 500 ký tự.
        public_id (str): Public ID của hình ảnh trên dịch vụ lưu trữ (ví dụ: Cloudinary), tối đa 500 ký tự.
        lien_ket (str): Liên kết khi người dùng nhấp vào banner, tối đa 500 ký tự.
        vi_tri (int): Vị trí hiển thị của banner (ví dụ: 1 - trang chủ, 2 - trang sản phẩm).
        trang_thai (Enum[TrangThaiAnhTrinhChieuEnum]): Trạng thái hiển thị của banner (True - hiển thị, False - ẩn).

    Phương thức:
        __repr__(): Trả về chuỗi đại diện cho đối tượng banner.
    """
    __tablename__ = 'anh_trinh_chieu'

    anh_trinh_chieu_id = db.Column(db.Integer, primary_key=True)
    tieu_de = db.Column(db.String(200), nullable=False)
    hinh_anh_url = db.Column(db.String(255), nullable=False)
    public_id = db.Column(db.String(255), nullable=False)
    lien_ket = db.Column(db.String(255), nullable=True)
    vi_tri = db.Column(db.Integer, nullable=False, default=1)
    trang_thai = db.Column(db.Enum(TrangThaiAnhTrinhChieuEnum), nullable=False, default=TrangThaiAnhTrinhChieuEnum.HIEU_LUC)

    def __repr__(self):
        return f'<Banner {self.tieu_de}>'