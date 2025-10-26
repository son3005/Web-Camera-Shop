import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """
    Lớp cấu hình cơ sở.
    """
    # Khóa bí mật dùng cho Flask (bắt buộc cho URLSafeTimedSerializer, session, v.v.)
    SECRET_KEY = os.environ.get('SECRET_KEY', 'myshop-secret-key-2025')

    # Khóa JWT (dành riêng cho xác thực người dùng)
    JWT_SECRET_KEY = os.environ.get(
        'JWT_SECRET_KEY',
        'b3bccc3498a97d10d5b8f9e96232006535981e9e41852b74a4f57b989ac8c937'
    )

    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Celery
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND')

    # Cloudinary
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')

    # Email
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'ha.0774979941@gmail.com'
    MAIL_PASSWORD = 'gnaxgmyblwcsrfub'
    MAIL_DEFAULT_SENDER = 'ha.0774979941@gmail.com'


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False
