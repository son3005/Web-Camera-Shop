from datetime import datetime
from app.extensions import db  # Giả sử db được import từ file chính

class User(db.Model):
    __tablename__ = 'users'
    __mapper_args__ = {
        'polymorphic_identity': 'user',  # Identity mặc định cho base class
        'polymorphic_on': 'role'  # Phân biệt subclass dựa trên cột 'role'
    }

    # Các cột cơ bản chung cho tất cả user
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # Không cần default nữa, sẽ set ở subclass
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Relationships chung ---
    # Giữ nguyên như cũ, nhưng chỉ áp dụng cho subclass nếu cần
    cart = db.relationship('Cart', back_populates='user', uselist=False, cascade="all, delete-orphan")
    orders = db.relationship('Order', back_populates='user', lazy='dynamic')
    reviews = db.relationship('Review', back_populates='user', lazy='dynamic')
    addresses = db.relationship('Address', back_populates='user', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<User {self.username}>'

# Subclass cho Khách Hàng (Customer)
class Customer(User):
    __mapper_args__ = {
        'polymorphic_identity': 'customer'  # Giá trị 'role' cho subclass này
    }

    # Có thể thêm cột riêng nếu cần (ví dụ: loyalty_points), nhưng hiện tại không cần vì STI dùng chung table

# Subclass cho Quản Trị Viên (Admin)
class Admin(User):
    __mapper_args__ = {
        'polymorphic_identity': 'admin'  # Giá trị 'role' cho subclass này
    }

    # Có thể thêm cột riêng nếu cần (ví dụ: admin_level), nhưng hiện tại không cần