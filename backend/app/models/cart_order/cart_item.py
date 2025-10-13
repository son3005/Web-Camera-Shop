from app.extensions import db
class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('carts.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    # --- Relationships ---
    # Mỗi mục trong giỏ hàng thuộc về một giỏ hàng
    cart = db.relationship('Cart', back_populates='items')
    
    # Mỗi mục trong giỏ hàng tương ứng với một sản phẩm
    product = db.relationship('Product', back_populates='cart_items')

    def __repr__(self):
        return f'<CartItem Product ID {self.product_id} in Cart ID {self.cart_id}>'