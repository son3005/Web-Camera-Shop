from app.extensions import db

class HinhAnhSanPham(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'hinh_anh_san_pham'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Khóa ngoại, liên kết tới bảng 'bien_the_san_pham'
    ma_bien_the_san_pham = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=False)
    
    # Đường dẫn URL của hình ảnh
    duong_dan_hinh_anh = db.Column(db.String(512), nullable=False)
    
    # Văn bản thay thế cho hình ảnh (dùng cho SEO và hỗ trợ người dùng)
    van_ban_thay_the = db.Column(db.String(200), nullable=True)
    
    # --- Mối quan hệ (Relationship) ---
    
    # Mỗi hình ảnh thuộc về một biến thể sản phẩm.
    # 'BienTheSanPham' là tên class ProductVariant đã Việt hóa.
    # 'cac_hinh_anh' là tên thuộc tính trong class BienTheSanPham để gọi lại.
    bien_the = db.relationship('BienTheSanPham', back_populates='cac_hinh_anh')
    
    def __repr__(self):
        return f'<Hình ảnh sản phẩm {self.id} cho Biến thể ID {self.ma_bien_the_san_pham}>'