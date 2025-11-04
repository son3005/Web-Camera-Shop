from sqlalchemy import event
from ...extensions import db

class CapDo(db.Model):
    """
    Đại diện cho thực thể 'cap_do' trong cơ sở dữ liệu.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi cấp độ.
        ma_cap_do (str): Mã cấp độ duy nhất, tối đa 5 ký tự.
        ten_cap_do (str): Tên cấp độ duy nhất, tối đa 100 ký tự.
        san_phams (BaseQuery): Quan hệ động đến các đối tượng 'SanPham' liên kết với cấp độ này.

    Quan hệ:
        san_phams: Quan hệ một-nhiều với model 'SanPham', đại diện cho tất cả sản phẩm thuộc cấp độ này.
    """
    __tablename__ = 'cap_do'

    id = db.Column(db.Integer, primary_key=True)
    ma_cap_do = db.Column(db.String(5), unique=True, nullable=False, index=True)
    ten_cap_do = db.Column(db.String(100), unique=True, nullable=False)

    san_phams = db.relationship('SanPham', back_populates='cap_do', lazy='dynamic') 