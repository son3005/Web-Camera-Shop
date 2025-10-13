from datetime import datetime
from app.extensions import db

class Product(db.Model):
    __tablename__ = 'products'

    # Các cột của bảng Sản phẩm
    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(100), unique=True, nullable=False, index=True) # Mã sản phẩm (SKU)
    name = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, nullable=False, default=0)
    
    # Các thuộc tính đặc tả của máy ảnh
    iso = db.Column(db.String(50), nullable=True)
    resolution = db.Column(db.String(50), nullable=True)
    sensor_type = db.Column(db.String(100), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Relationships ---
    # Một sản phẩm có thể có trong nhiều mục của giỏ hàng
    cart_items = db.relationship('CartItem', back_populates='product')
    
    # Một sản phẩm có thể có trong nhiều mục của đơn hàng
    order_items = db.relationship('OrderItem', back_populates='product')

    # Một sản phẩm có thể có nhiều đánh giá
    reviews = db.relationship('Review', back_populates='product', lazy='dynamic')

    def __repr__(self):
        return f'<Product {self.name}>'
        
    def update_stock(self, quantity):
        """Cập nhật số lượng tồn kho"""
        if self.stock >= quantity:
            self.stock -= quantity
            return True
        return False