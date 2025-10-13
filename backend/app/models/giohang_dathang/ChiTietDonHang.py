from app.extensions import db

class ChiTietDonHang(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'chi_tiet_don_hang'

    id = db.Column(db.Integer, primary_key=True)
    
    # Khóa ngoại, liên kết tới bảng 'don_hang'
    ma_don_hang = db.Column(db.Integer, db.ForeignKey('don_hang.id'), nullable=False)
    
    # Khóa ngoại, liên kết tới bảng 'san_pham'
    ma_san_pham = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False)
    
    so_luong = db.Column(db.Integer, nullable=False)
    
    # Lưu lại giá của sản phẩm tại thời điểm đặt hàng
    gia_luc_mua = db.Column(db.Float, nullable=False)

    # --- Các mối quan hệ (Relationships) ---
    
    # Mỗi chi tiết thuộc về một đơn hàng.
    # 'DonHang' là tên class Đơn Hàng.
    # 'cac_muc' là tên thuộc tính trong class DonHang để gọi lại.
    don_hang = db.relationship('DonHang', back_populates='cac_muc')
    
    # Mỗi chi tiết tương ứng với một sản phẩm.
    # 'SanPham' là tên class Sản Phẩm.
    # 'cac_chi_tiet_don_hang' là tên thuộc tính trong class SanPham để gọi lại.
    san_pham = db.relationship('SanPham', back_populates='cac_chi_tiet_don_hang')

    def __repr__(self):
        return f'<Chi tiết ĐH - Mã SP: {self.ma_san_pham} trong Đơn hàng mã: {self.ma_don_hang}>'