from sqlalchemy import event
from ...extensions import db

class DanhMuc(db.Model):
    """
    DanhMuc là một lớp đại diện cho bảng "danh_muc" trong cơ sở dữ liệu.
    Attributes:
        id (int): Khóa chính của bảng.
        ma_danh_muc (str): Mã danh mục, là chuỗi ký tự duy nhất, không được để trống, và có chỉ mục.
        ten_danh_muc (str): Tên danh mục, là chuỗi ký tự duy nhất, không được để trống.
        san_phams (relationship): Mối quan hệ một-nhiều với bảng "SanPham", cho phép truy cập danh sách sản phẩm thuộc danh mục này.
    Methods:
        __repr__(): Trả về chuỗi đại diện cho đối tượng DanhMuc, bao gồm tên danh mục.
    """
    
    __tablename__ = 'danh_muc'

    id = db.Column(db.Integer, primary_key=True)
    ma_danh_muc = db.Column(db.String(5), unique=True, nullable=False, index=True)
    ten_danh_muc = db.Column(db.String(100), unique=True, nullable=False)


    # --- Mối quan hệ ---
    san_phams = db.relationship('SanPham', back_populates='danh_muc', lazy='dynamic')

    def __repr__(self):
        return f'<Danh mục {self.ten_danh_muc}>'