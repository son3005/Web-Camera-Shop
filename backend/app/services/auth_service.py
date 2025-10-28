# backend/app/services/auth_service.py
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from datetime import timedelta
from flask_mail import Message
from flask import current_app
from typing import Dict, Any

from app.extensions import db, mail
from app.models.nguoidung import NguoiDung, KhachHang
from app.models.nguoidung.NguoiDung import TrangThaiNguoiDung
from app.schemas.nguoidung import NguoiDungResponse, NguoiDungCreate


class AuthError(Exception):
    """Custom exception cho các lỗi nghiệp vụ trong xác thực."""
    pass


class AuthService:
    # -------------------- LOGIN --------------------
    @staticmethod
    def login(email: str, password: str) -> Dict[str, Any]:
        """Xác thực người dùng và trả về {"user": dict, "token": jwt_token}"""
        # 1️⃣ Tìm user theo email (case-insensitive)
        user = NguoiDung.query.filter(NguoiDung.email.ilike(email)).first()

        if not user or not user.check_password(password):
            raise AuthError("Email hoặc mật khẩu không chính xác.")

        # 2️⃣ Kiểm tra trạng thái tài khoản
        if user.trang_thai != TrangThaiNguoiDung.KICH_HOAT:
            raise AuthError("Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt.")

        # 3️⃣ Tạo JWT token
        payload = {
            "id": user.id,
            "vai_tro": user.vai_tro.value if hasattr(user.vai_tro, "value") else str(user.vai_tro)
        }

        # --- BẮT ĐẦU SỬA LỖI TypeError ---
        # Lấy giá trị từ config, mặc định là 7 (ngày)
        expires_config = current_app.config.get("JWT_ACCESS_TOKEN_EXPIRES", 7)

        # Kiểm tra xem giá trị config đã là object timedelta chưa
        if isinstance(expires_config, timedelta):
            # Nếu ĐÚNG (là timedelta), dùng trực tiếp
            expires = expires_config
        else:
            # Nếu SAI (nó là số nguyên, vd: 7), thì tạo object timedelta
            try:
                # Chuyển đổi an toàn sang số nguyên
                expires = timedelta(days=int(expires_config))
            except (ValueError, TypeError):
                # Fallback an toàn nếu config bị sai (vd: "abc")
                expires = timedelta(days=7)
        
        token = create_access_token(identity=payload, expires_delta=expires)
        # --- KẾT THÚC SỬA LỖI ---

        # 4️⃣ Trả dữ liệu user theo schema để tránh lỗi serialize
        user_dict = NguoiDungResponse.from_orm(user).dict()

        return {"user": user_dict, "token": token}

    # -------------------- REGISTER --------------------
    @staticmethod
    def register(user_data: NguoiDungCreate) -> NguoiDung:
        """
        Đăng ký tài khoản khách hàng mới. Không commit tại service (commit ở route).
        """
        existing = NguoiDung.query.filter(NguoiDung.email.ilike(user_data.email)).first()
        if existing:
            raise AuthError("Email này đã được sử dụng.")

        new_user = KhachHang(
            email=user_data.email.lower(),
            ho_ten=user_data.ho_ten,
            so_dien_thoai=getattr(user_data, "so_dien_thoai", None),
        )
        new_user.set_password(user_data.mat_khau)

        db.session.add(new_user)
        return new_user

    # -------------------- PASSWORD RESET --------------------
    @staticmethod
    def create_reset_token(email: str, salt="reset-password") -> str:
        s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        return s.dumps(email, salt=salt)

    @staticmethod
    def send_password_reset_email(email: str):
        """Gửi email reset password. Luôn trả True nếu không lỗi gửi mail."""
        user = NguoiDung.query.filter(NguoiDung.email.ilike(email)).first()

        if not user:
            current_app.logger.info(f"Yêu cầu quên mật khẩu cho email không tồn tại: {email}")
            return True

        token = AuthService.create_reset_token(email)
        frontend = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
        reset_url = f"{frontend}/doimatkhau/{token}"

        msg = Message(
            subject="Khôi phục mật khẩu - Web Camera Shop",
            recipients=[email],
            body=(
                f"Xin chào {user.ho_ten or user.email},\n\n"
                f"Nhấn vào liên kết sau để tạo mật khẩu mới (hiệu lực 1 giờ):\n{reset_url}\n\n"
                f"Nếu bạn không yêu cầu, vui lòng bỏ qua email này.\n\n"
                f"Trân trọng,\nĐội ngũ Camera Shop"
            )
        )

        try:
            mail.send(msg)
            return True
        except Exception as e:
            current_app.logger.exception(f"Lỗi gửi email reset password: {e}")
            raise AuthError("Không thể gửi email đặt lại mật khẩu vào lúc này.")

    # -------------------- VERIFY TOKEN --------------------
    @staticmethod
    def verify_reset_token(token: str, expiration=3600, salt="reset-password") -> str:
        s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        try:
            return s.loads(token, salt=salt, max_age=expiration)
        except SignatureExpired:
            raise AuthError("Liên kết đặt lại mật khẩu đã hết hạn.")
        except BadSignature:
            raise AuthError("Liên kết không hợp lệ hoặc đã bị thay đổi.")

    # -------------------- RESET PASSWORD --------------------
    @staticmethod
    def reset_password(token: str, new_password: str):
        """Cập nhật mật khẩu mới cho user có token hợp lệ."""
        email = AuthService.verify_reset_token(token)
        user = NguoiDung.query.filter(NguoiDung.email.ilike(email)).first()
        if not user:
            raise AuthError("Không tìm thấy người dùng được liên kết với liên kết này.")

        user.set_password(new_password)
        return True