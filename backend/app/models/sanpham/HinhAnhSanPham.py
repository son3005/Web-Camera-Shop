# /backend/app/models/sanpham/HinhAnhSanPham.py

from  ...extensions import db
from sqlalchemy import event 
from ...services.cloudinary_service import CloudinaryService 


class HinhAnhSanPham(db.Model):
    """
    HinhAnhSanPham là một mô hình cơ sở dữ liệu đại diện cho hình ảnh của sản phẩm trong ứng dụng.
    Attributes:
        id (int): ID duy nhất của hình ảnh.
        bien_the_id (int): ID của biến thể sản phẩm mà hình ảnh này thuộc về. Liên kết với bảng 'bien_the_san_pham'.
        url (str): URL của hình ảnh.
        public_id (str): ID công khai của hình ảnh, thường được sử dụng để quản lý hình ảnh trên các dịch vụ lưu trữ.
        alt_text (str, optional): Văn bản thay thế cho hình ảnh, dùng để mô tả nội dung hình ảnh.
        la_anh_dai_dien (bool): Cờ xác định xem hình ảnh này có phải là ảnh đại diện của sản phẩm hay không. Mặc định là False.
        bien_the (BienTheSanPham): Quan hệ với mô hình 'BienTheSanPham', cho phép truy cập thông tin biến thể sản phẩm liên quan.
    Methods:
        __repr__(): Trả về chuỗi biểu diễn của đối tượng HinhAnhSanPham, bao gồm ID và public_id.
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


@event.listens_for(HinhAnhSanPham, 'after_delete')
def after_hinh_anh_delete_listener(mapper, connection, target: HinhAnhSanPham):
    """
    Lắng nghe sự kiện "sau khi xóa" một record HinhAnhSanPham.
    
    Mỗi khi một ảnh bị xóa khỏi DB (kể cả do cascade), hàm này
    sẽ được gọi và kích hoạt Celery task để xóa file trên Cloudinary.
    """
    if target.public_id:
        print(f"EVENT: Đã bắt sự kiện xóa HinhAnhSanPham. Kích hoạt task Celery xóa public_id: {target.public_id}")
        CloudinaryService.delete_image_task.delay(target.public_id)