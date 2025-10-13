# app/models/cart_order/order.py
from datetime import datetime
from app.extensions import db
import enum

class OrderStatus(enum.Enum):
    PENDING_PAYMENT = "Chờ thanh toán"
    PAID = "Đã thanh toán"
    SHIPPING = "Đang giao hàng"
    COMPLETED = "Hoàn thành"
    CANCELED = "Đã hủy"

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True)
    order_code = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.Enum(OrderStatus), default=OrderStatus.PENDING_PAYMENT, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Relationships ---
    # Mỗi đơn hàng thuộc về một người dùng
    user = db.relationship('User', back_populates='orders')
    
    # Một đơn hàng có nhiều sản phẩm (thông qua OrderItem)
    items = db.relationship('OrderItem', back_populates='order', cascade="all, delete-orphan")

    # Một đơn hàng có một giao dịch thanh toán
    payment = db.relationship('Payment', back_populates='order', uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Order {self.order_code}>'
        
    def create_order(self, cart):
        """Tạo đơn hàng từ giỏ hàng"""
        pass

    def update_status(self, new_status):
        """Cập nhật trạng thái đơn hàng"""
        pass
