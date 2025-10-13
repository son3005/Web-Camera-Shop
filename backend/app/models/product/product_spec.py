# app/models/product/product_spec.py
from app.extensions import db

class ProductSpec(db.Model):
    __tablename__ = 'product_specs'

    id = db.Column(db.Integer, primary_key=True)
    # Foreign Key để tạo quan hệ 1-1 với Product
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, unique=True)

    # --- Thông số Kỹ thuật ---
    
    # == Ánh sáng ==
    iso = db.Column(db.String(100), comment="ISO")
    shutter_speed = db.Column(db.String(100), comment="Tốc Độ Màn Trập")
    metering = db.Column(db.String(100), comment="Đo Sáng")
    white_balance = db.Column(db.String(100), comment="Cân Bằng Trắng")
    continuous_shooting_speed = db.Column(db.String(100), comment="Tốc Độ Chụp Liên Tục")

    # == Hình ảnh ==
    sensor_format = db.Column(db.String(100), comment="Định Dạng Cảm Biến")
    resolution = db.Column(db.String(100), comment="Độ Phân Giải")
    image_size = db.Column(db.String(100), comment="Kích Thước Ảnh")
    aspect_ratio = db.Column(db.String(50), comment="Tỷ Lệ Ảnh")
    sensor_type = db.Column(db.String(100), comment="Loại Cảm Biến")
    image_format = db.Column(db.String(100), comment="Định Dạng Ảnh")
    stabilization = db.Column(db.String(100), comment="Chống Rung")
    lens_mount = db.Column(db.String(100), comment="Ngàm Ống Kính")

    # == Video ==
    video_encoding = db.Column(db.String(100), comment="Mã Hóa Video")
    video_resolution = db.Column(db.String(100), comment="Độ Phân Giải Video")
    microphone = db.Column(db.String(100), comment="Micro")
    audio_format = db.Column(db.String(100), comment="Định Dạng Âm Thanh")

    # == Lấy nét ==
    focus_type = db.Column(db.String(100), comment="Kiểu Lấy Nét")
    focus_mode = db.Column(db.String(100), comment="Chế Độ Lấy Nét")
    focus_points = db.Column(db.String(100), comment="Số Điểm Lấy Nét")

    # == Kính ngắm/Màn hình ==
    viewfinder_type = db.Column(db.String(100), comment="Loại kính ngắm")
    screen_features = db.Column(db.String(200), comment="Đặc Tính Màn Hình")
    screen_resolution = db.Column(db.String(100), comment="Độ Phân Giải Màn Hình")
    screen_size = db.Column(db.String(50), comment="Kích Thước Màn Hình")
    viewfinder_magnification = db.Column(db.String(50), comment="Độ Phóng Đại Kính Ngắm")
    viewfinder_coverage = db.Column(db.String(50), comment="Độ Bao Phủ Kính Ngắm")
    viewfinder_size = db.Column(db.String(50), comment="Kích Thước Kính Ngắm")
    viewfinder_resolution = db.Column(db.String(100), comment="Độ Phân Giải Kính Ngắm")

    # == Đèn Flash ==
    flash = db.Column(db.String(100), comment="Đèn Flash")
    flash_mode = db.Column(db.String(100), comment="Chế Độ Flash")
    flash_speed = db.Column(db.String(100), comment="Tốc Độ Đánh Đèn")
    hot_shoe = db.Column(db.String(100), comment="Chân Kết Nối")
    exposure_compensation = db.Column(db.String(100), comment="Độ Bù Sáng")
    flash_sync = db.Column(db.String(100), comment="Đồng Bộ Flash")

    # == Kết Nối ==
    gps = db.Column(db.String(100), comment="GPS")
    wireless_connectivity = db.Column(db.String(150), comment="Kết Nối Không Dây")
    jacks = db.Column(db.String(150), comment="Jack Cắm")
    card_slots = db.Column(db.String(100), comment="Số Khe Cắm Thẻ Nhớ")

    # == Thông tin vật lý ==
    weight = db.Column(db.String(100), comment="Trọng Lượng")
    dimensions = db.Column(db.String(100), comment="Kích Thước")
    battery = db.Column(db.String(100), comment="Pin")
    
    def __repr__(self):
        return f'<ProductSpec for Product ID {self.product_id}>'
