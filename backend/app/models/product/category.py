from app.extensions import db
from datetime import datetime

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    
    # Mối quan hệ một-nhiều với Product
    # back_populates giúp SQLAlchemy đồng bộ mối quan hệ từ cả hai phía
    products = db.relationship('Product', back_populates='category')

    def __repr__(self):
        return f'<Category {self.name}>'

