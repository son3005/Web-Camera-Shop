# /backend/app/main.py

from flask import Flask, jsonify
from app.config import DevelopmentConfig
from app.extensions import db, migrate, jwt, cors, spec, celery
import cloudinary
import app.models
from dotenv import load_dotenv

# Import các routes (blueprints)
from app.routes.sanpham_routes import product_api
from app.routes.upload_routes import upload_api
from app.routes.danggia_routes import public_review_api, private_review_api 

def create_app(config_class=DevelopmentConfig):
    load_dotenv()
    app = Flask(__name__)
    
    # 1. Load configuration
    app.config.from_object(config_class)

    # 2. Initialize Flask extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    
    # (CẢI TIẾN) Dùng .register(app) thay vì .init_app(app)
    spec.register(app) 

    cloudinary.config(
        cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
        api_key=app.config['CLOUDINARY_API_KEY'],
        api_secret=app.config['CLOUDINARY_API_SECRET']
    )
    
    # Cấu hình Celery
    celery.config_from_object(app.config, namespace='CELERY')
    celery.autodiscover_tasks(['app.services'])

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    celery.Task = ContextTask

    
    # 3. Register Blueprints
    app.register_blueprint(product_api) 
    app.register_blueprint(upload_api) 
    app.register_blueprint(public_review_api)
    app.register_blueprint(private_review_api)
    
    
    # 4. Add routes
    @app.route('/')
    def index():
        return jsonify(message="Welcome to CameraStore API!")

    @app.route('/api/docs')
    def swagger_ui():
        return app.send_static_file('swagger-ui.html')

    @app.route('/api/swagger.json')
    def swagger_json():
        return jsonify(spec.generate_swagger())

    return app