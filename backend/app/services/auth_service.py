
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from datetime import timedelta
from app.models.nguoidung import NguoiDung, KhachHang
from app.extensions import db, mail
from flask_mail import Message
from flask import current_app


class AuthError(Exception):
    pass


class AuthService:
    # -------------------- ĐĂNG NHẬP --------------------
    @staticmethod
    def login(email: str, password: str) -> str:
        user = NguoiDung.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            raise AuthError("Email hoặc mật khẩu không chính xác.")

        token = create_access_token(
            identity={"id": user.id, "role": user.vai_tro.value},
            expires_delta=timedelta(hours=6),
        )
        return token

    # -------------------- ĐĂNG KÝ --------------------
    @staticmethod
    def register(email: str, ho_ten: str, password: str) -> NguoiDung:
        if NguoiDung.query.filter_by(email=email).first():
            raise AuthError("Email đã tồn tại.")

        user = KhachHang(email=email.strip().lower(), ho_ten=ho_ten.strip())
        user.set_password(password)
        db.session.add(user)
        db.session.flush()
        db.session.commit()
        return user

    # -------------------- TẠO TOKEN RESET MẬT KHẨU --------------------
    @staticmethod
    def create_reset_token(email: str) -> str:
        user = NguoiDung.query.filter_by(email=email).first()
        if not user:
            raise AuthError("Email không tồn tại trong hệ thống.")

        s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        return s.dumps(email, salt="reset-password")

    # -------------------- GỬI EMAIL RESET MẬT KHẨU --------------------
    @staticmethod
    def send_reset_email(email: str):
        token = AuthService.create_reset_token(email)
        reset_url = f"http://localhost:5173/reset-password?token={token}"

        msg = Message(
            subject="Khôi phục mật khẩu - Web Camera Shop",
            recipients=[email],
            body=f"Xin chào,\n\nBạn đã yêu cầu đặt lại mật khẩu. "
                 f"Nhấn vào liên kết sau để tạo mật khẩu mới:\n{reset_url}\n\n"
                 f"Nếu bạn không yêu cầu, vui lòng bỏ qua email này."
        )

        mail.send(msg)
        return True

    # -------------------- XÁC NHẬN TOKEN --------------------
    @staticmethod
    def verify_reset_token(token: str, expiration=3600) -> str:
        s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        try:
            email = s.loads(token, salt="reset-password", max_age=expiration)
            return email
        except SignatureExpired:
            raise AuthError("Liên kết đặt lại mật khẩu đã hết hạn.")
        except BadSignature:
            raise AuthError("Liên kết không hợp lệ hoặc bị thay đổi.")

    # -------------------- ĐẶT LẠI MẬT KHẨU --------------------
    @staticmethod
    def reset_password(token: str, new_password: str):
        email = AuthService.verify_reset_token(token)
        user = NguoiDung.query.filter_by(email=email).first()
        if not user:
            raise AuthError("Không tìm thấy người dùng.")
        user.set_password(new_password)
        db.session.add(user)
        db.session.commit()
        return True
