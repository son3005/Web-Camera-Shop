from app.extensions import db

class ProductVariant(db.Model):
    __tablename__ = 'product_variants'
    
    id = db.Column(db.Integer, primary_key=True)
    # Foreign Key trỏ về sản phẩm cha
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    
    name = db.Column(db.String(100), nullable=False) # Ví dụ: "Màu Đen", "Màu Bạc"
    sku = db.Column(db.String(120), unique=True, nullable=False, index=True) # SKU riêng cho từng biến thể
    price = db.Column(db.Float, nullable=False) # Giá có thể khác nhau cho mỗi biến thể
    stock = db.Column(db.Integer, nullable=False, default=0)
    
    # --- Relationships ---
    # Một biến thể có nhiều hình ảnh
    images = db.relationship('ProductImage', back_populates='variant', lazy='dynamic', cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<ProductVariant {self.name} for Product ID {self.product_id}>'