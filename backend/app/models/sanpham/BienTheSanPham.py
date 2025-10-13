from app.extensions import db

class BienTheSanPham(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'bien_the_san_pham'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Khóa ngoại, liên kết tới bảng 'san_pham'
    ma_san_pham = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False)
    
    # Tên của biến thể, ví dụ: "Màu Đen", "Bản 512GB"
    ten_bien_the = db.Column(db.String(100), nullable=False)
    
    # SKU riêng cho từng biến thể
    ma_sku = db.Column(db.String(120), unique=True, nullable=False, index=True)
    
    # Giá có thể khác nhau cho mỗi biến thể
    gia = db.Column(db.Float, nullable=False)
    
    # Số lượng tồn kho của biến thể
    so_luong_ton = db.Column(db.Integer, nullable=False, default=0)
    
    # --- Mối quan hệ (Relationship) ---
    
    # Một biến thể có thể có nhiều hình ảnh.
    # 'HinhAnhSanPham' là tên class ProductImage đã Việt hóa.
    # 'bien_the' là tên thuộc tính trong class HinhAnhSanPham để gọi lại.
    cac_hinh_anh = db.relationship('HinhAnhSanPham', back_populates='bien_the', lazy='dynamic', cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Biến thể {self.ten_bien_the} của Sản phẩm ID {self.ma_san_pham}>'