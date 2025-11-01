# /backend/app/routes/auth_routes.py

from typing import Dict, Optional
from flask import jsonify, current_app, url_for
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_openapi3 import APIBlueprint, OpenAPI
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from pydantic import ValidationError  # only for global handler (if needed)
from ..schemas.nguoidung import NguoiDungBase,NguoiDungCreate,NguoiDungUpdate,NguoiDungResponse,NguoiDungCoBanResponse

from ..extensions import db
from ..services.auth_service import AuthService, AuthError
import traceback

# -------------------------------------------------------
# Tạo APIBlueprint: giống Blueprint nhưng có OpenAPI + validation
# -------------------------------------------------------
auth_api = APIBlueprint("auth_api", __name__, url_prefix="/api/auth")


# -------------------------------------------------------
# Pydantic schemas (request & response). 
# model_config={"from_attributes": True} để model_validate ORM object
# -------------------------------------------------------
class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Email người dùng")
    mat_khau: str = Field(..., min_length=8, description="Mật khẩu")

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    user: Dict = Field(..., description="Thông tin người dùng")
    token: str = Field(..., description="JWT Access Token")

    model_config = {"from_attributes": True}


class RegisterRequest(BaseModel):
    ho_ten: str = Field(..., max_length=100, description="Họ và tên")
    email: EmailStr = Field(..., description="Email")
    mat_khau: str = Field(..., min_length=8, description="Mật khẩu")
    so_dien_thoai: Optional[str] = Field(None, max_length=15, description="SĐT")

    model_config = {"from_attributes": True}


class RegisterResponse(BaseModel):
    id: int = Field(..., description="ID người dùng")
    ho_ten: str = Field(..., description="Họ và tên")
    email: EmailStr = Field(..., description="Email")
    so_dien_thoai: Optional[str] = Field(None, description="SĐT")

    model_config = {"from_attributes": True}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Email cần đặt lại mật khẩu")


class ResetPasswordRequest(BaseModel):
    mat_khau: str = Field(..., min_length=8, description="Mật khẩu mới")

    model_config = ConfigDict(from_attributes=True)


class ResetPasswordPath(BaseModel):
    token: str = Field(..., description="Reset password token (được mã hóa)")

    model_config = {"from_attributes": True}


# -------------------------------------------------------
# 1) LOGIN
# -------------------------------------------------------
@auth_api.post("/login", responses={"200": LoginResponse})
def login(body: LoginRequest):  # ← Giữ param 'body: Model'
    try:
        result = AuthService.login(body.email, body.mat_khau)
        user = result["user"]  # AuthService.login trả về dict
        token = result["token"]

        response = LoginResponse(user=user, token=token)
        return jsonify(response.model_dump()), 200
    except AuthError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        current_app.logger.error(f"[auth.login] {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ."}), 500


# -------------------------------------------------------
# 2) REGISTER
# -------------------------------------------------------
@auth_api.post("/register", responses={"201": RegisterResponse})
def register(body: RegisterRequest): 
    try:
        new_user = AuthService.register(body)
        db.session.commit()
        response = RegisterResponse.model_validate(new_user)
        return jsonify(response.model_dump()), 201
    except AuthError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"[auth.register] {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ."}), 500


# -------------------------------------------------------
# 3) FORGOT PASSWORD
# -------------------------------------------------------
@auth_api.post("/forgot-password", responses={"200": None})
def forgot_password(body: ForgotPasswordRequest):  # ← Giữ param 'body: Model'
    try:
        reset_token = AuthService.forgot_password(body.email)
        return jsonify({"message": "Gửi email đặt lại mật khẩu thành công!"}), 200
    except AuthError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        current_app.logger.error(f"[auth.forgot_password] {traceback.format_exc()}")
        return jsonify({"error": "Không thể gửi email. Vui lòng thử lại sau."}), 500


# -------------------------------------------------------
# 4) VERIFY RESET TOKEN
# -------------------------------------------------------
@auth_api.get("/verify-reset-token/<token>", responses={"200": None})
def verify_reset_token(token: str):
    try:
        email = AuthService.verify_reset_token(token)
        return jsonify({"message": "Token hợp lệ", "email": email}), 200
    except AuthError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        current_app.logger.error(f"[auth.verify_reset_token] {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ."}), 500


# -------------------------------------------------------
# 5) RESET PASSWORD
# -------------------------------------------------------
@auth_api.post(
    "/reset-password/<path:token>",
    responses={"200": None}
)
def reset_password(
    path: ResetPasswordPath,      # ← NHẬN PATH PARAM QUA MODEL
    body: ResetPasswordRequest    # ← BODY
):
    try:
        AuthService.reset_password(path.token, body.mat_khau)
        db.session.commit()
        return jsonify({"message": "Đặt lại mật khẩu thành công!"}), 200
    except AuthError as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"[auth.reset_password] {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ nội bộ."}), 500


# -------------------------------------------------------
# 6) GET CURRENT USER - Protected endpoint
# -------------------------------------------------------
@auth_api.get("/me", responses={"200": RegisterResponse})
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        from ..models.nguoidung import NguoiDung  # local import để tránh cycles
        user = db.session.get(NguoiDung, int(user_id))
        if not user:
            return jsonify({"error": "Người dùng không tồn tại."}), 404

        response = RegisterResponse.model_validate(user)
        return jsonify(response.model_dump()), 200
    except Exception:
        current_app.logger.error(f"[auth.get_current_user] {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ."}), 500