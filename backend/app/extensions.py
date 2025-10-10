"""
File này dùng để khởi tạo các instances của extension.
Việc này giúp tránh lỗi import vòng (circular import).
"""
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy() # Quản lý kết nối và thao tác với cơ sở dữ liệu
migrate = Migrate() # Quản lý migration cho SQLAlchemy
jwt = JWTManager() # Quản lý JWT (JSON Web Tokens)
cors = CORS() # Cho phép CORS cho toàn bộ ứng dụng