from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token
from datetime import timedelta
from app.models.nguoidung import NguoiDung, KhachHang
from app.extensions import db


class AuthError(Exception):
    """Lỗi xác thực chung"""
    pass


class AuthService:
    """Xử lý đăng nhập, đăng ký, quên mật khẩu cho người dùng."""

    @staticmethod
    def login(email: str, password: str) -> str:
        """
        Đăng nhập: kiểm tra thông tin và trả về JWT Token.
        """
        user = NguoiDung.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            raise AuthError("Email hoặc mật khẩu không chính xác.")

        token = create_access_token(
            identity={"id": user.id, "role": user.vai_tro.value},
            expires_delta=timedelta(hours=6)
        )
        return token

    @staticmethod
    def register(email: str, ho_ten: str, password: str) -> NguoiDung:
        """
        Đăng ký tài khoản mới cho khách hàng.
        """
        if NguoiDung.query.filter_by(email=email).first():
            raise AuthError("Email đã được đăng ký.")

        user = KhachHang(email=email, ho_ten=ho_ten)
        user.set_password(password)

        db.session.add(user)
        # ❗ Không commit ở đây — commit ở route để đồng bộ transaction
        return user

    @staticmethod
    def forgot_password(email: str) -> bool:
        """
        Gửi email reset mật khẩu (demo).
        """
        user = NguoiDung.query.filter_by(email=email).first()
        if not user:
            raise AuthError("Email không tồn tại trong hệ thống.")

        # TODO: Gửi email qua Celery / Flask-Mail / SendGrid
        print(f"[DEBUG] Gửi mail khôi phục mật khẩu tới {email}")
        return True

    @staticmethod
    def logout():
        """(Server side) — nếu cần, có thể dùng Redis để blacklist token."""
        pass
