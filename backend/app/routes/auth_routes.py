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
def login(body: LoginRequest):
    """
    Định nghĩa các route liên quan đến xác thực người dùng cho ứng dụng web camera shop.

    Các chức năng chính:
    - Đăng nhập người dùng thông qua endpoint "/login".
        + Nhận thông tin đăng nhập (email và mật khẩu) từ phía client.
        + Gọi dịch vụ AuthService để xác thực thông tin đăng nhập.
        + Nếu thành công, trả về thông tin người dùng và token xác thực.
        + Nếu thất bại do sai thông tin đăng nhập, trả về thông báo lỗi với mã trạng thái 400.
        + Nếu có lỗi hệ thống, ghi log lỗi và trả về thông báo lỗi máy chủ với mã trạng thái 500.
    """
    try:
        result = AuthService.login(body.email, body.mat_khau)
        user = result["user"] 
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
    """
    Đăng ký người dùng mới.
    Tham số:
        body (RegisterRequest): Dữ liệu đăng ký người dùng, bao gồm các thông tin như tên, email, mật khẩu, v.v.
    Quy trình:
        - Gọi dịch vụ AuthService để tạo người dùng mới dựa trên thông tin nhận được.
        - Nếu thành công, lưu thay đổi vào cơ sở dữ liệu và trả về thông tin người dùng đã đăng ký.
        - Nếu xảy ra lỗi xác thực (AuthError), hoàn tác thay đổi và trả về thông báo lỗi cho người dùng.
        - Nếu xảy ra lỗi hệ thống khác, hoàn tác thay đổi, ghi log lỗi và trả về thông báo lỗi máy chủ.
    Trả về:
        - Nếu thành công: Trả về thông tin người dùng mới đăng ký (dưới dạng JSON) và mã trạng thái 201.
        - Nếu lỗi xác thực: Trả về thông báo lỗi và mã trạng thái 400.
        - Nếu lỗi máy chủ: Trả về thông báo lỗi máy chủ và mã trạng thái 500.
    """

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
def forgot_password(body: ForgotPasswordRequest):
    """
    Xử lý yêu cầu quên mật khẩu từ người dùng.
    Tham số:
        body (ForgotPasswordRequest): Dữ liệu yêu cầu chứa email của người dùng muốn đặt lại mật khẩu.
    Quy trình:
        - Nhận email từ người dùng thông qua body.
        - Gọi dịch vụ AuthService.forgot_password để tạo token đặt lại mật khẩu và gửi email hướng dẫn cho người dùng.
        - Nếu thành công, trả về thông báo gửi email thành công với mã trạng thái 200.
        - Nếu gặp lỗi xác thực (AuthError), trả về thông báo lỗi và mã trạng thái 400.
        - Nếu xảy ra lỗi hệ thống khác, ghi log lỗi và trả về thông báo lỗi chung với mã trạng thái 500.
    Trả về:
        - JSON chứa thông báo thành công hoặc lỗi, kèm mã trạng thái HTTP tương ứng.
    """

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
    """
    Xác thực token đặt lại mật khẩu.

    Hàm này nhận vào một chuỗi token, sau đó sử dụng dịch vụ AuthService để kiểm tra tính hợp lệ của token đó.

    Nếu token hợp lệ, trả về email liên kết với token và thông báo thành công.

    Nếu token không hợp lệ hoặc có lỗi xác thực, trả về thông báo lỗi tương ứng.

    Nếu xảy ra lỗi không xác định, ghi log lỗi và trả về thông báo lỗi máy chủ.

    Tham số:
        token (str): Chuỗi token đặt lại mật khẩu cần xác thực.

    Trả về:
        tuple: Đối tượng JSON chứa thông báo và email (nếu thành công) hoặc thông báo lỗi, kèm mã trạng thái HTTP.
    """

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
    """
    Đặt lại mật khẩu cho người dùng dựa trên token xác thực và mật khẩu mới.

    Tham số:
        path (ResetPasswordPath): Đối tượng chứa tham số đường dẫn, bao gồm token dùng để xác thực yêu cầu đặt lại mật khẩu.
        body (ResetPasswordRequest): Đối tượng chứa dữ liệu từ body của request, bao gồm mật khẩu mới mà người dùng muốn đặt.

    Quy trình:
        - Nhận token từ path và mật khẩu mới từ body.
        - Gọi dịch vụ AuthService để thực hiện đặt lại mật khẩu với token và mật khẩu mới.
        - Nếu thành công, commit thay đổi vào cơ sở dữ liệu và trả về thông báo thành công.
        - Nếu xảy ra lỗi xác thực (AuthError), rollback thay đổi và trả về thông báo lỗi cho người dùng.
        - Nếu xảy ra lỗi không xác định, rollback thay đổi, ghi log lỗi và trả về thông báo lỗi máy chủ nội bộ.

    Trả về:
        - Trả về JSON chứa thông báo thành công hoặc lỗi cùng với mã trạng thái HTTP tương ứng.
    """   
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
    """
    Lấy thông tin người dùng hiện tại dựa trên JWT token.
    Quy trình hoạt động:
    1. Lấy user_id từ JWT token thông qua hàm get_jwt_identity().
    2. Import model NguoiDung từ module models.nguoidung (import cục bộ để tránh vòng lặp import).
    3. Truy vấn cơ sở dữ liệu để lấy thông tin người dùng dựa trên user_id.
        - Nếu không tìm thấy người dùng, trả về mã lỗi 404 cùng thông báo "Người dùng không tồn tại."
    4. Nếu tìm thấy, chuyển đổi thông tin người dùng sang định dạng RegisterResponse và trả về dữ liệu dưới dạng JSON với mã thành công 200.
    5. Nếu có bất kỳ lỗi nào xảy ra trong quá trình xử lý, ghi log lỗi và trả về mã lỗi 500 cùng thông báo "Lỗi máy chủ."
    """

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
    

@auth_api.route("/doimatkhau/<token>", methods=["GET"])
def doimatkhau(token):
    # Route giả chỉ để url_for() build được link
    return jsonify({"message": "This is a frontend route"}), 200