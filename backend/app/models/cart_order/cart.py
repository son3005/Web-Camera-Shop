from app.extensions import db

class Cart(db.Model):
    __tablename__ = 'carts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)

    # --- Relationships ---
    # Quan hệ một-một ngược lại với User
    user = db.relationship('User', back_populates='cart')
    
    # Một giỏ hàng có nhiều sản phẩm (thông qua CartItem)
    items = db.relationship('CartItem', back_populates='cart', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Cart for User ID {self.user_id}>'

    @property
    def total_price(self):
        """Tính tổng tiền của giỏ hàng"""
        return sum(item.product.price * item.quantity for item in self.items)

    def add_product(self, product, quantity):
        """Thêm sản phẩm vào giỏ hàng"""
        pass

    def remove_product(self, product_id):
        """Xóa sản phẩm khỏi giỏ hàng"""
        pass
