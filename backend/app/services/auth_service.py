# backend/app/services/auth_service.py
from flask_jwt_extended import create_access_token
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from datetime import timedelta
from flask_mail import Message
from flask import current_app
from typing import Dict, Any
from ..utils.taoMa import generate_ma_nguoi_dung

from ..extensions import db, mail, bcrypt  # <-- pwd_context thay bcrypt
from ..models.nguoidung import NguoiDung, KhachHang
from ..models.enums import TrangThaiNguoiDungEnum
from ..schemas.nguoidung import NguoiDungResponse, NguoiDungCreate


class AuthError(Exception):
    """Custom exception cho các lỗi nghiệp vụ trong xác thực."""
    pass


class AuthService:
    # -------------------- HASH PASSWORD --------------------
    @staticmethod
    def hash_password(raw_password: str) -> str:
        """Tạo hash mật khẩu bằng passlib + bcrypt."""
        return bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    # -------------------- CHECK PASSWORD --------------------
    @staticmethod
    def check_password(hash_stored: str, raw_password: str) -> bool:
        """Kiểm tra mật khẩu bằng passlib + bcrypt."""
        return bcrypt.checkpw(raw_password.encode('utf-8'), hash_stored.encode('utf-8'))

    # -------------------- LOGIN --------------------
    @staticmethod
    def login(email: str, password: str) -> Dict[str, Any]:
        """Xác thực người dùng và trả về {"user": dict, "token": jwt_token}"""
        # 1️⃣ Tìm user theo email (case-insensitive)
        user = NguoiDung.query.filter(NguoiDung.email.ilike(email)).first()

        if not user or not AuthService.check_password(user.mat_khau_hash, password):
            raise AuthError("Email hoặc mật khẩu không chính xác.")

        # 2️⃣ Kiểm tra trạng thái tài khoản
        if user.trang_thai != TrangThaiNguoiDungEnum.KICH_HOAT:
            raise AuthError("Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt.")

        # 3️⃣ Tạo JWT token
        identity = str(user.id)

        claims = {"vai_tro": user.vai_tro.value}

        token = create_access_token(identity=identity, 
                                    expires_delta=timedelta(days=7),
                                    additional_claims=claims
                                    )

        user_resp = NguoiDungResponse.from_orm(user).dict()
        return {"user": user_resp, "token": token}

    # -------------------- REGISTER --------------------
    @staticmethod
    def register(data: NguoiDungCreate) -> NguoiDung:
        """Tạo người dùng mới với mật khẩu đã hash."""
        if NguoiDung.query.filter(NguoiDung.email.ilike(data.email)).first():
            raise AuthError("Email này đã tồn tại.")

        new_user = KhachHang(
            email=data.email.lower(),
            ma_nguoi_dung = generate_ma_nguoi_dung(),
            mat_khau_hash=AuthService.hash_password(data.mat_khau),
            ho_ten=data.ho_ten,
            vai_tro="KHACH_HANG",
            trang_thai="KICH_HOAT"
        )

        db.session.add(new_user)
        return new_user  # Commit ở route

    # -------------------- FORGOT PASSWORD --------------------
    @staticmethod
    def forgot_password(email: str) -> bool:
        """Gửi email reset password nếu user tồn tại."""
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

    # -------------------- CREATE RESET TOKEN --------------------
    @staticmethod
    def create_reset_token(email: str) -> str:
        s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        return s.dumps(email, salt="reset-password")

    # -------------------- VERIFY TOKEN --------------------
    @staticmethod
    def verify_reset_token(token: str, expiration=3600) -> str:
        s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        try:
            return s.loads(token, salt="reset-password", max_age=expiration)
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

        user.mat_khau_hash = AuthService.hash_password(new_password)
        return True