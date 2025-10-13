from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from app.models.NguoiDung import User, Customer
from app.extensions import db

class AuthService:
    @staticmethod
    def login(email, password):
        """login(): Xử lý đăng nhập cho mọi user.
        - Tìm user bằng email, check mật khẩu.
        - Trả về JWT token.
        """
        user = User.query.filter_by(email=email).first()
        if not user or not check_password_hash(user.mat_khau, password):
            raise ValueError("Email hoặc mật khẩu sai")
        token = create_access_token(identity=user.ma_nguoi_dung)
        return token

    @staticmethod
    def logout():
        """logout(): Thường xử lý ở client-side (xóa token). Server có thể blacklist nếu cần."""
        pass  # Implement blacklist với Redis nếu dùng

    @staticmethod
    def forgot_password(email):
        """forgot_password(): Gửi email reset password (dùng Celery cho background)."""
        user = User.query.filter_by(email=email).first()
        if not user:
            raise ValueError("Email không tồn tại")
        # Logic gửi email (ví dụ: generate reset token và gửi qua email service)
        # Sử dụng Celery: from app.tasks import send_reset_email; send_reset_email.delay(user.email)
        pass

    @staticmethod
    def dang_ky(email, ten_dang_nhap, password):
        """dangKy(): Đăng ký cho KhachHang (Customer).
        - Tạo Customer instance.
        """
        if User.query.filter_by(email=email).first() or User.query.filter_by(ten_dang_nhap=ten_dang_nhap).first():
            raise ValueError("Email hoặc tên đăng nhập đã tồn tại")
        mat_khau = generate_password_hash(password)
        customer = Customer(email=email, ten_dang_nhap=ten_dang_nhap, mat_khau=mat_khau)
        db.session.add(customer)
        db.session.commit()
        return customer