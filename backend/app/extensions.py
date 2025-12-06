import os
from redis import Redis
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mailman import Mail
from celery import Celery
from payos import PayOS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
mail = Mail()

# SỬA LẠI: Kết nối Redis với URL từ environment
redis_url = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
redis = Redis.from_url(redis_url, decode_responses=True)

# Celery sẽ được khởi tạo trong celery_worker.py
celery = Celery()
payos = None

def init_payos(app):
    """Khởi tạo PayOS với cấu hình từ app"""
    global payos
    if all([app.config.get('PAYOS_CLIENT_ID'), 
            app.config.get('PAYOS_API_KEY'), 
            app.config.get('PAYOS_CHECKSUM_KEY')]):
        payos = PayOS(
            client_id=app.config['PAYOS_CLIENT_ID'],
            api_key=app.config['PAYOS_API_KEY'],
            checksum_key=app.config['PAYOS_CHECKSUM_KEY']
        )
    return payos

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """
    Callback để load user từ JWT token
    """
    from .models.nguoidung import NguoiDung  # Import trong hàm để tránh circular import
    identity = jwt_data["sub"]
    return NguoiDung.query.filter_by(id=identity).first()


__all__ = ['db', 'migrate', 'jwt', 'cors', 'mail', 'celery', 'redis', 'payos', 'init_payos']