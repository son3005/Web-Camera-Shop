# /backend/app/main.py
import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify, send_from_directory
from flask_openapi3 import OpenAPI

from .config import DevelopmentConfig, ProductionConfig, TestingConfig
from .extensions import db, migrate, jwt, cors, mail, celery
import cloudinary

# === Import các route APIBlueprint ===
from .routes.auth_routes import auth_api
from .routes.sanpham_routes import product_api
from .routes.upload_routes import upload_api
from .routes.danhgia_routes import review_api
from .routes.giohang_routes import cart_api
from .routes.donhang_routes import order_api
from .routes.khac_routes import catalogs_api

# =====================================================
# LOGGING CONFIG
# =====================================================
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
console_handler = logging.StreamHandler()
console_handler.setFormatter(formatter)

logger.addHandler(handler)
logger.addHandler(console_handler)
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

# =====================================================
# TẠO OpenAPI instance
# =====================================================
openapi = OpenAPI(
    __name__,
    info={
        "title": "CameraShop API",
        "version": "1.0.0",
        "description": "API quản lý sản phẩm, đơn hàng, giỏ hàng, đánh giá, người dùng và upload ảnh."
    }
)

# =====================================================
# CREATE APP
# =====================================================
def create_app(config_class=None):
    app = Flask(__name__, static_folder='static')

    # --- CONFIG ---
    env = os.getenv("FLASK_ENV", "development").lower()
    if config_class is None:
        config_class = {
            "production": ProductionConfig,
            "testing": TestingConfig,
            "development": DevelopmentConfig
        }.get(env, DevelopmentConfig)
    app.config.from_object(config_class)

    logger.info(f"=== Flask App Started ({env}) ===")

    # --- EXTENSIONS ---
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    mail.init_app(app)

    # --- CLOUDINARY ---
    if all(k in app.config for k in ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']):
        cloudinary.config(
            cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
            api_key=app.config['CLOUDINARY_API_KEY'],
            api_secret=app.config['CLOUDINARY_API_SECRET'],
            secure=True
        )
        logger.info("Cloudinary initialized")
    else:
        logger.warning("Missing Cloudinary config")

    # --- CELERY CONFIG ---
    celery.conf.broker_url = app.config['CELERY_BROKER_URL']
    celery.conf.result_backend = app.config['CELERY_RESULT_BACKEND']
    celery.conf.update(app.config)
    celery.autodiscover_tasks(['app.services'])

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    celery.Task = ContextTask

    app.extensions['celery'] = celery

    # =====================================================
    # REGISTER API BLUEPRINTS (SỬA TẠI ĐÂY)
    # =====================================================
    api_blueprints = [
        auth_api,
        product_api,
        upload_api,
        review_api,
        cart_api,
        order_api,
        catalogs_api,
    ]

    for api in api_blueprints:
        app.register_blueprint(api, url_prefix=api.url_prefix)  # ← SỬA DÒNG NÀY
        logger.debug(f"Registered APIBlueprint: {api.name} at {api.url_prefix}")

    # =====================================================
    # OPENAPI SPEC
    # =====================================================
    @app.route('/api/openapi.json')
    def openapi_spec():
        return jsonify(openapi.spec)

    @app.route('/docs')
    def redoc_ui():
        return send_from_directory(app.static_folder, 'redoc.html')

    @app.route('/')
    def index():
        return jsonify(message="Welcome to CameraShop API!", docs="/docs", status="running")

    app.extensions['openapi'] = openapi

    return app