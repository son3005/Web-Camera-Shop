from app.extensions import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Float, nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    image_url = db.Column(db.String(512), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Khóa ngoại trỏ tới bảng categories
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    
    # Mối quan hệ nhiều-một với Category
    category = db.relationship('Category', back_populates='products')

    def __repr__(self):
        return f'<Product {self.name}>'