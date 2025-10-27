from flask import Blueprint, request, jsonify, url_for, current_app
from app.extensions import db, mail
from flask_mail import Message
from app.services.auth_service import AuthService, AuthError
from flask_jwt_extended import jwt_required, get_jwt_identity

auth_api = Blueprint("auth_api", __name__, url_prefix="/api/auth")

# -------------------- ĐĂNG KÝ --------------------
@auth_api.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    try:
        user = AuthService.register(
            email=data.get("email"),
            ho_ten=data.get("ho_ten"),
            password=data.get("mat_khau"),
        )
        return jsonify(message="🎉 Đăng ký thành công!", user={"email": user.email}), 201
    except AuthError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400
    except Exception as e:
        db.session.rollback()
        print("❌ Lỗi khi đăng ký:", e)
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500


# -------------------- ĐĂNG NHẬP --------------------
@auth_api.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    try:
        token = AuthService.login(
            email=data.get("email"),
            password=data.get("mat_khau"),
        )
        return jsonify(access_token=token), 200
    except AuthError as e:
        return jsonify(error=str(e)), 401
    except Exception as e:
        print("❌ Lỗi khi đăng nhập:", e)
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500


# -------------------- QUÊN MẬT KHẨU (GỬI EMAIL THẬT) --------------------
@auth_api.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()

    # Kiểm tra đầu vào
    email = data.get("email")
    if not email:
        return jsonify(error="Email không được để trống!"), 400

    try:
        # Tạo token reset
        token = AuthService.create_reset_token(email)
        reset_link = f"http://localhost:5173/doimatkhau/{token}"

        # Debug in ra log để kiểm tra giá trị
        print(f"📧 Gửi mail tới: {email}")
        print(f"🔗 Link reset: {reset_link}")

        # Tạo email message
        msg = Message(
            subject="Khôi phục mật khẩu - Camera Shop",
            sender=current_app.config["MAIL_DEFAULT_SENDER"],
            recipients=[str(email)],  # ✅ ép kiểu chuỗi để tránh lỗi NoneType
            body=f"Xin chào,\n\nVui lòng nhấn vào liên kết sau để đặt lại mật khẩu:\n{reset_link}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.",
        )

        # Gửi mail
        mail.send(msg)
        print("✅ Email đã được gửi thành công!")

        return jsonify(message="📩 Email khôi phục mật khẩu đã được gửi!"), 200

    except AuthError as e:
        print("⚠️ AuthError:", e)
        return jsonify(error=str(e)), 404

    except Exception as e:
        # In lỗi chi tiết ra log để dễ debug
        import traceback
        traceback.print_exc()
        print("❌ Lỗi gửi email:", e)
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500



# -------------------- ĐẶT LẠI MẬT KHẨU --------------------
@auth_api.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):
    if request.method == "GET":
        # Khi người dùng bấm link trong email, chỉ cần xác thực token
        try:
            email = AuthService.verify_reset_token(token)
            return jsonify({
                "message": "Liên kết hợp lệ, bạn có thể đặt lại mật khẩu.",
                "email": email
            }), 200
        except AuthError as e:
            return jsonify(error=str(e)), 400

    # Khi người dùng gửi form đổi mật khẩu
    if request.method == "POST":
        data = request.get_json()
        new_password = data.get("mat_khau")
        try:
            AuthService.reset_password(token, new_password)
            return jsonify(message="✅ Đổi mật khẩu thành công!"), 200
        except AuthError as e:
            db.session.rollback()
            return jsonify(error=str(e)), 400
        except Exception as e:
            db.session.rollback()
            print("❌ Lỗi reset mật khẩu:", e)
            return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500

