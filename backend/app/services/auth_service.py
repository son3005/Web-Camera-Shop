# backend/app/services/auth_service.py
from flask_jwt_extended import create_access_token
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from datetime import datetime, timedelta
from flask_mailman import EmailMessage
from flask import current_app, url_for
from typing import Dict, Any
import logging  # THÊM: Import logging
from flask import current_app

from ..utils.taoMa import generate_ma_nguoi_dung
from ..extensions import db, mail
import bcrypt
from ..models.nguoidung import NguoiDung, KhachHang
from ..models.enums import TrangThaiNguoiDungEnum, VaiTroNguoiDungEnum
from ..schemas.nguoidung import NguoiDungResponse, NguoiDungCreate

# THÊM: Logger riêng cho service
logger = logging.getLogger(__name__)

class AuthError(Exception):
    """Custom exception cho các lỗi nghiệp vụ trong xác thực."""
    pass


class AuthService:

    # -------------------- HASH PASSWORD --------------------
    @staticmethod
    def hash_password(raw_password: str) -> str:
        """Tạo hash mật khẩu bằng passlib + bcrypt."""
        logger.debug("Bắt đầu hash mật khẩu")  # THÊM: Log debug
        return bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # -------------------- CHECK PASSWORD --------------------
    @staticmethod
    def check_password(hash_stored: str, raw_password: str) -> bool:
        """Kiểm tra mật khẩu bằng passlib + bcrypt."""
        logger.debug("Bắt đầu kiểm tra mật khẩu")  # THÊM: Log debug
        return bcrypt.checkpw(raw_password.encode('utf-8'), hash_stored.encode('utf-8'))

    # -------------------- LOGIN --------------------
    @staticmethod
    def login(email: str, password: str) -> Dict[str, Any]:
        """Xác thực người dùng và trả về {"user": dict, "token": jwt_token}"""
        logger.info(f"Bắt đầu login với email: {email}")  # THÊM: Log info

        # 1. Tìm user theo email (case-insensitive)
        user = NguoiDung.query.filter(NguoiDung.email.ilike(email)).first()
        if not user:
            logger.warning(f"Không tìm thấy user với email: {email}")  # THÊM: Log cảnh báo
            raise AuthError("Email hoặc mật khẩu không chính xác.")

        if not AuthService.check_password(user.mat_khau_hash, password):
            logger.warning(f"Mật khẩu sai cho user_id: {user.id}")  # THÊM: Log cảnh báo
            raise AuthError("Email hoặc mật khẩu không chính xác.")

        # 2. Kiểm tra trạng thái tài khoản
        if user.trang_thai != TrangThaiNguoiDungEnum.KICH_HOAT:
            logger.warning(f"Tài khoản bị khóa hoặc chưa kích hoạt - user_id: {user.id}")  # THÊM
            raise AuthError("Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt.")

        # 3. Tạo JWT token
        identity = str(user.id)
        claims = {"vai_tro": user.vai_tro.value}
        token = create_access_token(
            identity=identity,
            expires_delta=timedelta(days=7),
            additional_claims=claims
        )
        user.lan_cuoi_dang_nhap = datetime.utcnow()
        db.session.commit()
        user_resp = NguoiDungResponse.model_validate(user).model_dump()
        logger.info(f"Login thành công - user_id: {user.id}, vai_tro: {user.vai_tro.value}")  # THÊM: Log thành công
        return {"user": user_resp, "token": token}

    # -------------------- REGISTER --------------------
    @staticmethod
    def register(data: NguoiDungCreate) -> NguoiDung:
        """Đăng ký người dùng mới."""
        logger.info(f"Bắt đầu đăng ký user với email: {data.email}")  # THÊM: Log bắt đầu

        # Kiểm tra email đã tồn tại
        existing_user = NguoiDung.query.filter(NguoiDung.email.ilike(data.email)).first()
        if existing_user:
            logger.warning(f"Email đã tồn tại: {data.email}")  # THÊM
            raise AuthError("Email này đã được sử dụng.")

        # Tạo user mới
        new_user = NguoiDung(
            ma_nguoi_dung=generate_ma_nguoi_dung(),
            email=data.email,
            mat_khau_hash=AuthService.hash_password(data.mat_khau),
            ho_ten=data.ho_ten,
            so_dien_thoai=data.so_dien_thoai,
            vai_tro=VaiTroNguoiDungEnum.KHACH_HANG,
            trang_thai=TrangThaiNguoiDungEnum.KICH_HOAT
        )

        db.session.add(new_user)
        logger.info(f"Đăng ký thành công - user_id: {new_user.id}, email: {data.email}")  # THÊM
        return new_user

    # -------------------- FORGOT PASSWORD --------------------
    @staticmethod
    def forgot_password(email: str) -> bool:
        """Gửi email reset password nếu user tồn tại."""
        logger.info(f"Bắt đầu forgot password cho email: {email}")  # THÊM: Log bắt đầu

        user = NguoiDung.query.filter(NguoiDung.email.ilike(email)).first()
        if not user:
            raise AuthError("Email không tồn tại.")

        token = AuthService.create_reset_token(email)
        frontend_url = current_app.config["FRONTEND_URL"]
        reset_url = f"{frontend_url}/doimatkhau/{token}"

        msg = EmailMessage(
            subject="Đặt lại mật khẩu - CameraShop",
            body=f"Nhấp vào liên kết để đặt lại mật khẩu: {reset_url}\nLiên kết có hiệu lực trong 1 giờ.",
            from_email=current_app.config['MAIL_DEFAULT_SENDER'],  # ← THÊM DÒNG NÀY
            to=[email],
        )

        try:
            msg.send()
            logger.info(f"Email reset gửi thành công cho {email}")
            return token
        except Exception as e:
            logger.error(f"Lỗi gửi email: {str(e)}")
            raise AuthError("Không thể gửi email đặt lại mật khẩu vào lúc này.")

    # -------------------- CREATE RESET TOKEN --------------------
    @staticmethod
    def create_reset_token(email: str) -> str:
        logger.debug(f"Tạo reset token cho email: {email}")  # THÊM: Log debug
        s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        return s.dumps(email, salt="reset-password")

    # -------------------- VERIFY TOKEN --------------------
    @staticmethod
    def verify_reset_token(token: str, expiration=3600) -> str:
        logger.debug(f"Xác thực reset token (expiration: {expiration}s)")
        s = URLSafeTimedSerializer(current_app.config["SECRET_KEY"])
        try:
            email = s.loads(token, salt="reset-password", max_age=expiration)
            logger.info(f"Token hợp lệ, email: {email}")
            return email
        except SignatureExpired:
            logger.warning("Reset token đã hết hạn")
            raise AuthError("Liên kết đặt lại mật khẩu đã hết hạn.")
        except BadSignature:
            logger.warning("Reset token không hợp lệ hoặc đã bị thay đổi")
            raise AuthError("Liên kết không hợp lệ hoặc đã bị thay đổi.")
        except Exception as e:  # ← Bắt mọi lỗi khác
            logger.error(f"Lỗi không xác định khi verify token: {str(e)}")
            raise AuthError("Token không hợp lệ.")

    # -------------------- RESET PASSWORD --------------------
    @staticmethod
    def reset_password(token: str, new_password: str) -> bool:
        """Cập nhật mật khẩu mới cho user có token hợp lệ."""
        logger.info("Bắt đầu reset password")  # THÊM: Log bắt đầu

        email = AuthService.verify_reset_token(token)
        user = NguoiDung.query.filter(NguoiDung.email.ilike(email)).first()
        if not user:
            logger.warning(f"Không tìm thấy user khi reset password cho email: {email}")  # THÊM
            raise AuthError("Không tìm thấy người dùng được liên kết với liên kết này.")

        user.mat_khau_hash = AuthService.hash_password(new_password)
        logger.info(f"Reset password thành công cho user_id: {user.id}")  # THÊM: Log thành công
        return True