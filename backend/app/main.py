from flask import Flask, jsonify
from app.config import Config
from app.extensions import db, migrate, jwt, cors
# Import models để Flask-Migrate có thể nhận diện được chúng
from app.models import User, Product, Category
from dotenv import load_dotenv

def create_app(config_class=Config):
    """
    Hàm tạo ứng dụng Flask (Application Factory Pattern).
    """

    load_dotenv()
    app = Flask(__name__)
    
    # 1. Load configuration
    app.config.from_object(config_class)

    # 2. Initialize Flask extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    # Cấu hình CORS để cho phép frontend (chạy ở port 5173) gọi API
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # 3. Register Blueprints (chúng ta sẽ thêm sau)
    # from .routes.product_routes import bp as product_bp
    # app.register_blueprint(product_bp, url_prefix='/api/products')
    
    # 4. Add a simple route for testing
    @app.route('/')
    def index():
        return "Backend for Camera Shop is running!"

    return app