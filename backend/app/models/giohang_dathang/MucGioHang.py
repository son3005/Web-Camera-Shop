from app.extensions import db

class MucGioHang(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'muc_gio_hang'

    # Khóa chính của bảng
    id = db.Column(db.Integer, primary_key=True)
    
    # Khóa ngoại, liên kết tới bảng 'gio_hang'
    ma_gio_hang = db.Column(db.Integer, db.ForeignKey('gio_hang.id'), nullable=False)
    
    # Khóa ngoại, liên kết tới bảng 'san_pham'
    ma_san_pham = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False)
    
    # Số lượng của sản phẩm trong giỏ hàng
    so_luong = db.Column(db.Integer, nullable=False, default=1)

    # --- Các mối quan hệ (Relationships) ---
    
    # Mỗi mục thuộc về một giỏ hàng.
    # 'GioHang' là tên class Giỏ Hàng.
    # 'cac_muc' là tên thuộc tính trong class GioHang để gọi lại danh sách các mục này.
    gio_hang = db.relationship('GioHang', back_populates='cac_muc')
    
    # Mỗi mục tương ứng với một sản phẩm.
    # 'SanPham' là tên class Sản Phẩm.
    # 'cac_muc_gio_hang' là tên thuộc tính trong class SanPham để gọi lại.
    san_pham = db.relationship('SanPham', back_populates='cac_muc_gio_hang')

    def __repr__(self):
        return f'<Mục Giỏ Hàng - Mã SP: {self.ma_san_pham} trong Giỏ Hàng mã: {self.ma_gio_hang}>'