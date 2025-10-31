import os
from flask import Flask, jsonify
from .config import DevelopmentConfig, ProductionConfig, TestingConfig
from .extensions import db, migrate, jwt, cors, spec, celery, mail
import cloudinary

# Import các routes (blueprints)
from .routes.auth_routes import auth_api
from .routes.sanpham_routes import product_api
from .routes.upload_routes import upload_api
from .routes.danggia_routes import public_review_api, private_review_api
from .routes.giohang_routes import cart_api
from .routes.donhang_routes import order_api


def create_app(config_class=None):
    app = Flask(__name__)

    # === Xác định config ===
    if config_class is None:
        env = os.getenv("FLASK_ENV", "development").lower()
        if env == "production":
            config_class = ProductionConfig
        elif env == "testing":
            config_class = TestingConfig
        else:
            config_class = DevelopmentConfig

    app.config.from_object(config_class)

    # 1. Initialize Flask extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
    )
    spec.register(app)
    mail.init_app(app)

    # 2. Cấu hình Cloudinary (chỉ nếu có config thật)
    if all([
        app.config.get('CLOUDINARY_CLOUD_NAME'),
        app.config.get('CLOUDINARY_API_KEY'),
        app.config.get('CLOUDINARY_API_SECRET'),
    ]):
        cloudinary.config(
            cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
            api_key=app.config['CLOUDINARY_API_KEY'],
            api_secret=app.config['CLOUDINARY_API_SECRET'],
        )

    # 3. Cấu hình Celery
    celery.conf.update(app.config)
    celery.autodiscover_tasks(['app.services'])

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    celery.Task = ContextTask

    # 4. Register Blueprints — đảm bảo không bị trùng
    blueprints = {
        "product_api": product_api,
        "upload_api": upload_api,
        "public_review_api": public_review_api,
        "private_review_api": private_review_api,
        "cart_api": cart_api,
        "order_api": order_api,
        "auth_api": auth_api,
    }

    app.blueprints.clear()
    app.url_map = app.url_map.__class__()

    for name, bp in blueprints.items():
        if name not in app.blueprints:
            app.register_blueprint(bp)

    # 5. Các route mặc định
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
