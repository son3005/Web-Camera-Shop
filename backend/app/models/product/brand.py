from app.extensions import db

class Brand(db.Model):
    __tablename__ = 'brands'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    logo_url = db.Column(db.String(512), nullable=True)

    # --- Relationships ---
    # Một thương hiệu có nhiều sản phẩm
    products = db.relationship('Product', back_populates='brand', lazy='dynamic')
    
    def __repr__(self):
        return f'<Brand {self.name}>'