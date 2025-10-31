from sqlalchemy import event
from ...extensions import db
from ...services.cloudinary_service import CloudinaryService 

class ThuongHieu(db.Model):
    """
    Class ThuongHieu đại diện cho bảng 'thuong_hieu' trong cơ sở dữ liệu.
    Attributes:
        id (int): Khóa chính của bảng, tự động tăng.
        ma_thuong_hieu (str): Mã thương hiệu, chuỗi tối đa 5 ký tự, duy nhất, không được để trống, có chỉ mục.
        ten_thuong_hieu (str): Tên thương hiệu, chuỗi tối đa 100 ký tự, duy nhất, không được để trống.
        logo_url (str, optional): URL của logo thương hiệu, chuỗi tối đa 512 ký tự, có thể để trống.
        public_id (str): Dùng để lưu id của ảnh trên Cloudinary
        san_phams (dynamic relationship): Mối quan hệ một-nhiều với bảng 'SanPham', sử dụng back_populates để liên kết với thuộc tính 'thuong_hieu' trong model SanPham.
    Methods:
        __repr__(): Trả về chuỗi đại diện cho đối tượng ThuongHieu, hiển thị tên thương hiệu.
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
    
@event.listens_for(ThuongHieu, 'after_delete')
def after_thuong_hieu_delete_listener(mapper, connection, target):
    if target.public_id: 
        CloudinaryService.delete_image_task.delay(target.public_id)