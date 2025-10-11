from app.main import create_app
import os

# Tạo instance của ứng dụng
# FLASK_CONFIG có thể là 'development', 'production',... (chúng ta sẽ cấu hình sau)
# Mặc định dùng config cơ bản
app = create_app(os.getenv('FLASK_CONFIG') or 'app.config.Config')

if __name__ == "__main__":
    app.run()
