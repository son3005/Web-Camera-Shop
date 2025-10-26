from flask import Blueprint, request, jsonify
from app.extensions import db
from app.services.auth_service import AuthService, AuthError

auth_api = Blueprint("auth_api", __name__, url_prefix="/api/auth")


@auth_api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    try:
        token = AuthService.login(
            email=data.get("email"),
            password=data.get("mat_khau")
        )
        return jsonify(access_token=token), 200
    except AuthError as e:
        return jsonify(error=str(e)), 401
    except Exception as e:
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500


@auth_api.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    try:
        user = AuthService.register(
            email=data.get("email"),
            ho_ten=data.get("ho_ten"),
            password=data.get("mat_khau")
        )
        db.session.commit()
        return jsonify(message="Đăng ký thành công", user={"email": user.email}), 201
    except AuthError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500


@auth_api.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    try:
        AuthService.forgot_password(data.get("email"))
        return jsonify(message="Đã gửi mail khôi phục mật khẩu (demo)."), 200
    except AuthError as e:
        return jsonify(error=str(e)), 404
    except Exception as e:
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500
