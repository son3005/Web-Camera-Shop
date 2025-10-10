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
    # Khóa này rất quan trọng để bảo mật session và ký JWT.
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'b3bccc3498a97d10d5b8f9e96232006535981e9e41852b74a4f57b989ac8c937')

    # --- ĐÂY LÀ DÒNG SỬA LỖI QUAN TRỌNG NHẤT ---
    # Đọc chuỗi kết nối database từ biến môi trường 'DATABASE_URL'
    # và gán nó vào key 'SQLALCHEMY_DATABASE_URI' mà Flask-SQLAlchemy yêu cầu.
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL')
    
    # Tắt tính năng theo dõi sửa đổi của SQLAlchemy để tiết kiệm tài nguyên.
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Cấu hình cho Celery, cũng đọc từ biến môi trường
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL')
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND')

# Bạn có thể tạo thêm các lớp cấu hình riêng cho từng môi trường nếu cần
# class DevelopmentConfig(Config):
#     DEBUG = True

# class ProductionConfig(Config):
#     DEBUG = False