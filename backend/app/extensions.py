# /backend/app/extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mailman import Mail
from celery import Celery
from redis import Redis
from payos import PayOS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
redis = Redis()
mail = Mail()
celery = Celery()
payos = None  # Khởi tạo PayOS sau khi có config

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

__all__ = ['db', 'migrate', 'jwt', 'cors', 'mail', 'celery', 'redis', 'payos', 'init_payos']