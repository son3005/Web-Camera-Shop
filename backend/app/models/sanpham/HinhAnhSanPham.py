# /backend/app/models/sanpham/HinhAnhSanPham.py

from  ...extensions import db
from sqlalchemy import event 



class HinhAnhSanPham(db.Model):
    """
    Mô hình HinhAnhSanPham đại diện cho hình ảnh của biến thể sản phẩm trong cơ sở dữ liệu.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi hình ảnh.
        bien_the_id (int): Khóa ngoại liên kết đến bảng 'bien_the_san_pham', xác định biến thể sản phẩm mà hình ảnh thuộc về.
        url (str): Đường dẫn URL của hình ảnh.
        public_id (str): Định danh công khai duy nhất của hình ảnh (thường dùng cho các dịch vụ lưu trữ như Cloudinary).
        alt_text (str, optional): Văn bản thay thế cho hình ảnh, hỗ trợ SEO và truy cập.
        thu_tu (int): Thứ tự hiển thị của hình ảnh trong danh sách.
        la_anh_dai_dien (bool): Đánh dấu hình ảnh này có phải là ảnh đại diện cho biến thể sản phẩm hay không.
        bien_the (BienTheSanPham): Quan hệ ORM đến mô hình BienTheSanPham, cho phép truy cập thông tin biến thể sản phẩm liên quan.
        
    Phương thức:
        __repr__(): Trả về chuỗi biểu diễn đối tượng hình ảnh sản phẩm, bao gồm id và public_id.
    """
    __tablename__ = 'hinh_anh_san_pham'

    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    bien_the_id = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=False, index=True)
    url = db.Column(db.String(512), nullable=False)
    public_id = db.Column(db.String(255), nullable=False, unique=True, index=True) 
    alt_text = db.Column(db.String(200), nullable=True)
    thu_tu = db.Column(db.Integer, nullable=False)
    la_anh_dai_dien = db.Column(db.Boolean, default=False, nullable=False)
    bien_the = db.relationship('BienTheSanPham', back_populates='hinh_anhs')
    #--- Ràng buộc ---
 
    def __repr__(self):
        return f'<Hình ảnh {self.id} - public_id: {self.public_id}>'
