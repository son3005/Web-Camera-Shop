"""
File này dùng để khởi tạo các instances của extension.
Việc này giúp tránh lỗi import vòng (circular import).
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_pydantic_spec import FlaskPydanticSpec
from flask_mail import Mail  # 🔹 Thêm dòng này để sử dụng Flask-Mail
from celery import Celery

# --- Khởi tạo các extension ---
db = SQLAlchemy()             # Quản lý kết nối và thao tác với cơ sở dữ liệu
migrate = Migrate()           # Quản lý migration cho SQLAlchemy
jwt = JWTManager()            # Quản lý JWT (JSON Web Tokens)
cors = CORS()                 # Cho phép CORS cho toàn bộ ứng dụng
spec = FlaskPydanticSpec()    # Quản lý tài liệu API với Pydantic-Spec
celery = Celery()             # Quản lý các tác vụ bất đồng bộ với Celery
mail = Mail()                 # ✅ Thêm phần này để khởi tạo Flask-Mail
