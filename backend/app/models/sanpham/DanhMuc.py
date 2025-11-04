from sqlalchemy import event
from ...extensions import db

class DanhMuc(db.Model):
    """
    Lớp DanhMuc đại diện cho bảng 'danh_muc' trong cơ sở dữ liệu.

    Thuộc tính:
        id (int): Khóa chính, tự động tăng.
        ma_danh_muc (str): Mã danh mục, duy nhất, không được để trống, tối đa 5 ký tự.
        ten_danh_muc (str): Tên danh mục, duy nhất, không được để trống, tối đa 100 ký tự.

    Quan hệ:
        san_phams (relationship): Danh sách các sản phẩm thuộc danh mục này.
        
    Phương thức:
        __repr__(): Trả về chuỗi đại diện cho đối tượng DanhMuc.
    """
    
    __tablename__ = 'danh_muc'

    id = db.Column(db.Integer, primary_key=True)
    ma_danh_muc = db.Column(db.String(5), unique=True, nullable=False, index=True)
    ten_danh_muc = db.Column(db.String(100), unique=True, nullable=False)


    # --- Mối quan hệ ---
    san_phams = db.relationship('SanPham', back_populates='danh_muc', lazy='dynamic')

    def __repr__(self):
        return f'<Danh mục {self.ten_danh_muc}>'