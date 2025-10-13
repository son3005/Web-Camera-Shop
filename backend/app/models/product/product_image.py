from app.extensions import db

class ProductImage(db.Model):
    __tablename__ = 'product_images'
    
    id = db.Column(db.Integer, primary_key=True)
    # Foreign Key trỏ về biến thể sản phẩm
    product_variant_id = db.Column(db.Integer, db.ForeignKey('product_variants.id'), nullable=False)
    
    image_url = db.Column(db.String(512), nullable=False)
    alt_text = db.Column(db.String(200), nullable=True) # Text thay thế cho SEO và hỗ trợ
    
    # --- Relationships ---
    variant = db.relationship('ProductVariant', back_populates='images')
    
    def __repr__(self):
        return f'<ProductImage {self.id} for Variant ID {self.product_variant_id}>'