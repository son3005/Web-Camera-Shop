#app/models/cart_order/payment.py
from datetime import datetime
from app.extensions import db
import enum

class PaymentMethod(enum.Enum):
    CASH = "Tiền mặt"
    EWALLET = "Ví điện tử"

class PaymentStatus(enum.Enum):
    UNPAID = "Chưa thanh toán"
    PAID = "Đã thanh toán"
    FAILED = "Thất bại"

class Payment(db.Model):
    __tablename__ = 'payments' # Tương ứng với ThanhToan

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, unique=True)
    amount = db.Column(db.Float, nullable=False)
    method = db.Column(db.Enum(PaymentMethod), nullable=False)
    status = db.Column(db.Enum(PaymentStatus), default=PaymentStatus.UNPAID, nullable=False)
    transaction_id = db.Column(db.String(200), nullable=True) # ID giao dịch từ bên thứ ba

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Relationships ---
    order = db.relationship('Order', back_populates='payment')

    def __repr__(self):
        return f'<Payment for Order ID {self.order_id}>'

    def process_payment(self):
        """Xử lý giao dịch thanh toán"""
        pass