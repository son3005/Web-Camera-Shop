from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token
import mysql.connector
from datetime import datetime, timedelta

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret-key"  # đổi sau khi deploy
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# 🔌 Kết nối MySQL
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",      # nếu bạn dùng Docker, có thể là tên service
        user="root",           # đổi theo tài khoản MySQL của bạn
        password="root",
        database="webcamera_db"
    )

# 🧱 API Đăng ký
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Vui lòng nhập đầy đủ email và mật khẩu"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if user:
        return jsonify({"error": "Email đã được đăng ký"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
    cursor.execute("INSERT INTO users (email, password_hash) VALUES (%s, %s)", (email, hashed_pw))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Đăng ký thành công"}), 201

# 🔑 API Đăng nhập
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if not user:
        return jsonify({"error": "Email chưa được đăng ký"}), 404

    if not bcrypt.check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Sai mật khẩu"}), 401

    token = create_access_token(
        identity={"id": user["id"], "email": user["email"]},
        expires_delta=timedelta(hours=3)
    )

    return jsonify({"message": "Đăng nhập thành công", "token": token}), 200

if __name__ == "__main__":
    app.run(debug=True)
