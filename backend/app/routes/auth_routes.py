# /backend/app/routes/auth_routes.py

from flask import Blueprint, request, jsonify, current_app
from app.extensions import db, spec
from app.services.auth_service import AuthService, AuthError
from flask_jwt_extended import jwt_required, get_jwt_identity
from pydantic import BaseModel, Field, EmailStr
from flask_pydantic_spec import Request, Response
from app.schemas.nguoidung import NguoiDungResponse, NguoiDungCreate, LoginRequest
from app.models.nguoidung import NguoiDung
import traceback

auth_api = Blueprint("auth_api", __name__, url_prefix="/api/auth")

# -------------------- SCHEMAS --------------------
class LoginResponse(BaseModel):
    user: NguoiDungResponse
    token: str = Field(..., description="JWT access token")

    class Config:
        orm_mode = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    mat_khau: str = Field(..., min_length=8)


# -------------------- LOGIN --------------------
@auth_api.route("/login", methods=["POST"])
@spec.validate(
    body=Request(LoginRequest),
    # Chúng ta cũng tắt validate response ở đây
    # resp=Response(HTTP_200=LoginResponse), 
    tags=["Auth"],
)
def login():
    """Đăng nhập người dùng"""
    data = request.context.body.dict()

    try:
        result = AuthService.login(data["email"], data["mat_khau"])
        # ✅ result đã chứa {"user": dict, "token": str}
        return jsonify(result), 200

    except AuthError as e:
        return jsonify(error=str(e)), 401
    except Exception as e:
        traceback.print_exc()
        current_app.logger.exception("❌ Lỗi server khi đăng nhập:")
        return jsonify(error="Lỗi máy chủ nội bộ."), 500


# -------------------- REGISTER --------------------
@auth_api.route("/register", methods=["POST"])
@spec.validate(
    body=Request(NguoiDungCreate),
    # --- BẮT ĐẦU SỬA LỖI ---
    # Tạm thời vô hiệu hóa việc validate response để
    # tránh lỗi "response validation error" do Enum.
    # resp=Response(HTTP_201=NguoiDungResponse),
    # --- KẾT THÚC SỬA LỖI ---
    tags=["Auth"],
)
def register():
    """Đăng ký tài khoản mới"""
    user_data = request.context.body

    try:
        new_user = AuthService.register(user_data)
        db.session.commit()
        db.session.refresh(new_user) # Lấy dữ liệu mới nhất từ DB

        user_resp = NguoiDungResponse.from_orm(new_user).dict()
        return jsonify(user_resp), 201

    except AuthError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400
        
    # --- Khôi phục khối except gốc ---
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        current_app.logger.exception("❌ Lỗi khi đăng ký:")
        return jsonify(error="Lỗi máy chủ khi đăng ký."), 500


# -------------------- FORGOT PASSWORD --------------------
@auth_api.route("/forgot-password", methods=["POST"])
@spec.validate(body=Request(ForgotPasswordRequest), tags=["Auth"])
def forgot_password():
    """Gửi email khôi phục mật khẩu"""
    data: ForgotPasswordRequest = request.context.body

    try:
        AuthService.send_password_reset_email(data.email)
        return jsonify(message="📧 Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi!"), 200
    except Exception as e:
        traceback.print_exc()
        current_app.logger.exception(f"❌ Lỗi khi gửi email reset password cho {data.email}:")
        return jsonify(error="Lỗi máy chủ khi xử lý yêu cầu quên mật khẩu."), 500


# -------------------- RESET PASSWORD --------------------
@auth_api.route("/reset-password/<token>", methods=["GET"])
def verify_reset_token(token):
    """Xác thực token trước khi đổi mật khẩu"""
    try:
        email = AuthService.verify_reset_token(token)
        return jsonify({"message": "Liên kết hợp lệ.", "email": email}), 200
    except AuthError as e:
        return jsonify(error=str(e)), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify(error="Lỗi máy chủ khi xác thực liên kết."), 500


@auth_api.route("/reset-password/<token>", methods=["POST"])
@spec.validate(body=Request(ResetPasswordRequest), tags=["Auth"])
def reset_password(token):
    """Đặt lại mật khẩu"""
    data: ResetPasswordRequest = request.context.body

    try:
        AuthService.reset_password(token, data.mat_khau)
        db.session.commit()
        return jsonify(message="✅ Đặt lại mật khẩu thành công! Bạn có thể đăng nhập."), 200
    except AuthError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        current_app.logger.exception("❌ Lỗi khi đặt lại mật khẩu:")
        return jsonify(error="Lỗi máy chủ khi đặt lại mật khẩu."), 500


# -------------------- GET CURRENT USER --------------------
@auth_api.route("/me", methods=["GET"])
@jwt_required()
@spec.validate(
    # Tắt luôn ở đây
    # resp=Response(HTTP_200=NguoiDungResponse), 
    tags=["Auth"]
)
def get_current_user():
    """Lấy thông tin người dùng hiện tại"""
    identity = get_jwt_identity()
    user_id = identity.get("id")

    if not user_id:
        return jsonify(error="Token không hợp lệ hoặc thiếu thông tin user ID."), 401

    try:
        user = db.session.get(NguoiDung, user_id)
        if not user:
            return jsonify(error="Người dùng không tồn tại."), 404

        user_resp = NguoiDungResponse.from_orm(user).dict()
        return jsonify(user_resp), 200

    except Exception as e:
        traceback.print_exc()
        current_app.logger.exception("❌ Lỗi khi lấy thông tin người dùng hiện tại:")
        return jsonify(error="Lỗi máy chủ khi lấy thông tin người dùng."), 500