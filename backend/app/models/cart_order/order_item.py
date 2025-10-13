# app/models/cart_order/order_item.py
from app.extensions import db

class OrderItem(db.Model):
    __tablename__ = 'order_items' # Tương ứng với ChiTietDonHang

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price_at_purchase = db.Column(db.Float, nullable=False) # Lưu lại giá tại thời điểm mua

    # --- Relationships ---
    # Mỗi mục đơn hàng thuộc về một đơn hàng
    order = db.relationship('Order', back_populates='items')
    
    # Mỗi mục đơn hàng tương ứng với một sản phẩm
    product = db.relationship('Product', back_populates='order_items')

    @property
    def subtotal(self):
        """Tính thành tiền cho mục này"""
        return self.quantity * self.price_at_purchase

    def __repr__(self):
        return f'<OrderItem Product ID {self.product_id} in Order ID {self.order_id}>'
