import os





class Config:
    """
    Lớp cấu hình cơ sở.
    Các cấu hình khác (Development, Production) sẽ kế thừa từ lớp này.
    """
    # Khóa bí mật dùng cho Flask (bắt buộc cho URLSafeTimedSerializer, session, v.v.)
    SECRET_KEY = os.environ.get('SECRET_KEY', 'myshop-secret-key-2025')

    # Khóa JWT (dành riêng cho xác thực người dùng)
    JWT_SECRET_KEY = os.environ.get(
        'JWT_SECRET_KEY',
        '6e5d8f3aa23b2fec0959da24bd47cef833f30a8dd8cb79ac9dbd0a37f18e3ed6'
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
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = os.environ.get('MAIL_PORT', 587)
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', MAIL_USERNAME)


class DevelopmentConfig(Config):
    DEBUG = True



class ProductionConfig(Config):
    DEBUG = False
