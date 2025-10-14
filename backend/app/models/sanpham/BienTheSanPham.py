# app/models/bien_the_san_pham.py
from sqlalchemy import CheckConstraint
from app.extensions import db

class BienTheSanPham(db.Model):
    __tablename__ = 'bien_the_san_pham' # ĐỀ XUẤT: Dùng snake_case

    id = db.Column(db.Integer, primary_key=True)
    
    # SỬA LỖI: Khớp kiểu dữ liệu khóa ngoại
    san_pham_goc_id = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False, index=True)    
    # ma_sku là một tên tốt
    ma_sku = db.Column(db.String(120), unique=True, nullable=False, index=True)
    
    ten_bien_the = db.Column(db.String(100), nullable=True) # Ví dụ: "Chỉ thân máy"
    
    # Dùng Numeric là lựa chọn tuyệt vời!
    gia = db.Column(db.Numeric(12, 2), nullable=False)
    gia_khuyen_mai = db.Column(db.Numeric(12, 2), nullable=True)
    gia_nhap_vao = db.Column(db.Numeric(12, 2), nullable=True)
    so_luong_ton = db.Column(db.Integer, nullable=False, default=0)
    
    # --- Mối quan hệ ---
    san_pham_goc = db.relationship('SanPham', back_populates='cac_bien_the')
    hinh_anhs = db.relationship('HinhAnhSanPham', back_populates='bien_the', cascade="all, delete-orphan")

    # Mối quan hệ với giỏ hàng và đơn hàng (sẽ được tạo ở các model khác)
    # muc_gio_hangs = db.relationship('MucGioHang', back_populates='bien_the_san_pham')
    # chi_tiet_don_hangs = db.relationship('ChiTietDonHang', back_populates='bien_the_san_pham')
    
    # ĐỀ XUẤT: Thêm ràng buộc ở cấp độ DB
    __table_args__ = (
        CheckConstraint('gia > 0', name='check_gia_positive'),
        CheckConstraint('so_luong_ton >= 0', name='check_so_luong_ton_non_negative'),
        CheckConstraint('gia_khuyen_mai IS NULL OR (gia_khuyen_mai > 0 AND gia_khuyen_mai < gia)', name='check_gia_khuyen_mai_valid'),
    )

    def __repr__(self):
        return f'<Biến thể SKU {self.ma_sku}>'
