# app/models/chi_tiet_don_hang.py

from app.extensions import db

class ChiTietDonHang(db.Model):
    __tablename__ = 'chi_tiet_don_hang'

    id = db.Column(db.Integer, primary_key=True)
    don_hang_id = db.Column(db.Integer, db.ForeignKey('don_hang.id'), nullable=False, index=True)
    bien_the_san_pham_id = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=True) 
    
    # --- "ĐÓNG BĂNG" DỮ LIỆU TẠI THỜI ĐIỂM MUA ---
    sku_luc_mua = db.Column(db.String(150), nullable=False)
    ten_san_pham_luc_mua = db.Column(db.String(255), nullable=False)
    ten_bien_the_luc_mua = db.Column(db.String(150), nullable=True)
    don_gia_luc_mua = db.Column(db.Numeric(12, 2), nullable=False)
    so_luong = db.Column(db.Integer, nullable=False)
    
    # --- Mối quan hệ ---
    don_hang = db.relationship('DonHang', back_populates='items')
    # Liên kết "mềm" tới biến thể, không cần back_populates
    bien_the_san_pham = db.relationship('BienTheSanPham') 
    # Mối quan hệ một-một với DanhGia
    danh_gia = db.relationship('DanhGia', back_populates='chi_tiet_don_hang', uselist=False)

    def __repr__(self):
        return f'<Chi tiết Đơn hàng {self.id}: {self.so_luong} x {self.sku_luc_mua}>'