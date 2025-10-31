from flask import Blueprint, request, jsonify, current_app
from ..extensions import db, spec
from ..services.auth_service import AuthService, AuthError
from flask_jwt_extended import jwt_required, get_jwt_identity
from pydantic import BaseModel, Field, EmailStr
from flask_pydantic_spec import Request, Response
from ..schemas.nguoidung import NguoiDungResponse, NguoiDungCreate, LoginRequest
from ..models.nguoidung import NguoiDung
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
    tags=["Auth"],
)
def login():
    """Đăng nhập người dùng"""
    data = request.context.body.dict()

    try:
        result = AuthService.login(data["email"], data["mat_khau"])
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
    tags=["Auth"],
)
def register():
    """Đăng ký tài khoản mới"""
    user_data = request.context.body

    try:
        new_user = AuthService.register(user_data)
        db.session.commit()
        db.session.refresh(new_user)

        user_resp = NguoiDungResponse.from_orm(new_user).dict()
        return jsonify(user_resp), 201
    except AuthError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400
    except Exception as e:
        db.session.rollback()
        traceback.print_exc()
        current_app.logger.exception("❌ Lỗi khi đăng ký:")
        return jsonify(error="Lỗi máy chủ khi đăng ký tài khoản."), 500


# -------------------- FORGOT PASSWORD --------------------
@auth_api.route("/forgot-password", methods=["POST"])
@spec.validate(body=Request(ForgotPasswordRequest), tags=["Auth"])
def forgot_password():
    """Gửi email reset mật khẩu"""
    data: ForgotPasswordRequest = request.context.body

    try:
        AuthService.forgot_password(data.email)
        return jsonify(message="✅ Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi."), 200
    except AuthError as e:
        return jsonify(error=str(e)), 400
    except Exception as e:
        traceback.print_exc()
        current_app.logger.exception("❌ Lỗi khi gửi email quên mật khẩu:")
        return jsonify(error="Lỗi máy chủ khi gửi yêu cầu."), 500


# -------------------- VERIFY RESET TOKEN --------------------
@auth_api.route("/verify-reset-token/<token>", methods=["GET"])
@spec.validate(tags=["Auth"])
def verify_reset_token(token):
    """Xác thực token reset mật khẩu"""
    try:
        email = AuthService.verify_reset_token(token)
        return jsonify({"message": "Liên kết hợp lệ.", "email": email}), 200
    except AuthError as e:
        return jsonify(error=str(e)), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify(error="Lỗi máy chủ khi xác thực liên kết."), 500


# -------------------- RESET PASSWORD --------------------
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
    tags=["Auth"]
)
def get_current_user():
    """Lấy thông tin người dùng hiện tại"""
    user_id_str = get_jwt_identity()

    if not user_id_str:
        return jsonify(error="Token không hợp lệ hoặc thiếu thông tin user ID."), 401

    try:
        user_id_int = int(user_id_str)
        user = db.session.get(NguoiDung, user_id_int)
        
        if not user:
            return jsonify(error="Người dùng không tồn tại."), 404

        user_resp = NguoiDungResponse.from_orm(user).dict()
        return jsonify(user_resp), 200
    
    except (ValueError, TypeError):
        return jsonify(error="Định dạng token không hợp lệ."), 401
    except Exception as e:
        traceback.print_exc()
        current_app.logger.exception("❌ Lỗi khi lấy thông tin người dùng hiện tại:")
        return jsonify(error="Lỗi máy chủ khi lấy thông tin người dùng."), 500