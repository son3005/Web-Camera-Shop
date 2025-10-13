from datetime import datetime
from app.extensions import db

class SanPham(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'san_pham'

    # Các cột của bảng
    id = db.Column(db.Integer, primary_key=True)
    
    # Mã sản phẩm (SKU)
    ma_san_pham = db.Column(db.String(100), unique=True, nullable=False, index=True)
    ten = db.Column(db.String(200), nullable=False, index=True)
    mo_ta = db.Column(db.Text, nullable=True)
    gia = db.Column(db.Float, nullable=False)
    so_luong_ton = db.Column(db.Integer, nullable=False, default=0)
    
    # Các thuộc tính đặc tả của máy ảnh
    iso = db.Column(db.String(50), nullable=True)
    do_phan_giai = db.Column(db.String(50), nullable=True)
    loai_cam_bien = db.Column(db.String(100), nullable=True)
    
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Các mối quan hệ (Relationships) ---
    
    # Một sản phẩm có thể có trong nhiều mục của giỏ hàng
    # 'MucGioHang' là tên class CartItem đã Việt hóa
    # 'san_pham' là tên thuộc tính trong class MucGioHang để gọi lại
    cac_muc_gio_hang = db.relationship('MucGioHang', back_populates='san_pham')
    
    # Một sản phẩm có thể có trong nhiều chi tiết đơn hàng
    # 'ChiTietDonHang' là tên class OrderItem đã Việt hóa
    # 'san_pham' là tên thuộc tính trong class ChiTietDonHang để gọi lại
    cac_chi_tiet_don_hang = db.relationship('ChiTietDonHang', back_populates='san_pham')

    # Một sản phẩm có thể có nhiều đánh giá
    # 'DanhGia' là tên class Review đã Việt hóa
    # 'san_pham' là tên thuộc tính trong class DanhGia để gọi lại
    cac_danh_gia = db.relationship('DanhGia', back_populates='san_pham', lazy='dynamic')

    def __repr__(self):
        return f'<Sản phẩm {self.ten}>'
        