# /backend/app/config.py
import os


class Config:
    """
    Lớp cấu hình cơ sở.
    Các cấu hình khác (Development, Production, Testing) sẽ kế thừa từ lớp này.
    """
    SECRET_KEY = os.environ.get('SECRET_KEY', 'myshop-secret-key-2025')

    JWT_SECRET_KEY = os.environ.get(
        'JWT_SECRET_KEY',
        '6e5d8f3aa23b2fec0959da24bd47cef833f30a8dd8cb79ac9dbd0a37f18e3ed6'
    )

    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND')

    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')

    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', MAIL_USERNAME)


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'mysql+pymysql://root:password@db:3306/camera_shop'
    )

    # BẬT LOGGING CHO SQLALCHEMY
    SQLALCHEMY_ECHO = True  # IN RA TẤT CẢ SQL QUERY
    SQLALCHEMY_RECORD_QUERIES = True


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')


class TestingConfig(Config):
    """
    Cấu hình dành riêng cho testing.
    - Dùng SQLite in-memory → siêu nhanh
    - Tắt email, Cloudinary, JWT nghiêm ngặt
    - Celery chạy sync, không cần Redis thật
    """
    TESTING = True
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'SQLALCHEMY_DATABASE_URI',
        'sqlite:///:memory:'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAIL_SUPPRESS_SEND = True
    MAIL_DEFAULT_SENDER = ('Test', 'test@example.com')

    JWT_SECRET_KEY = 'test-jwt-secret'
    JWT_TOKEN_LOCATION = ['headers']
    JWT_HEADER_NAME = 'Authorization'
    JWT_HEADER_TYPE = 'Bearer'

    CLOUDINARY_CLOUD_NAME = 'test'
    CLOUDINARY_API_KEY = '123'
    CLOUDINARY_API_SECRET = 'abc'

    CELERY_TASK_ALWAYS_EAGER = True
    CELERY_TASK_EAGER_PROPAGATES = True
    CELERY_BROKER_URL = 'memory://'
    CELERY_RESULT_BACKEND = 'cache+memory://'
