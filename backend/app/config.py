import os
from dotenv import load_dotenv

# Tải tất cả các biến môi trường từ file .env trong thư mục `backend`
# Lệnh này sẽ tự động tìm và nạp file .env
load_dotenv()

class Config:
    """
    Lớp cấu hình cơ sở.
    Các cấu hình khác (Development, Production) sẽ kế thừa từ lớp này.
    """
    # Lấy khóa bí mật từ biến môi trường, nếu không có thì dùng một giá trị mặc định.
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'b3bccc3498a97d10d5b8f9e96232006535981e9e41852b74a4f57b989ac8c937')

    # Đọc chuỗi kết nối database từ biến môi trường 'DATABASE_URL'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # Tắt tính năng theo dõi sửa đổi của SQLAlchemy để tiết kiệm tài nguyên.
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Cấu hình cho Celery, cũng đọc từ biến môi trường
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND')

    # Cấu hình Cloudinary
    CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET')


class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False