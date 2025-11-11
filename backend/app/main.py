# backend/app/main.py
import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify, send_from_directory
from flask_openapi3 import OpenAPI
from payos import PayOS
from .config import DevelopmentConfig, ProductionConfig, TestingConfig
from .extensions import db, migrate, jwt, cors, mail, celery
import cloudinary
from celery.schedules import crontab
from .tasks import *

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
    
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    celery.Task = ContextTask

    app.extensions['celery'] = celery

    # =====================================================
    # PAYOS INITIALIZATION
    # =====================================================
    try:
        # Kiểm tra xem có đủ cấu hình PayOS không
        payos_config_required = ['PAYOS_CLIENT_ID', 'PAYOS_API_KEY', 'PAYOS_CHECKSUM_KEY']
        has_payos_config = all(app.config.get(key) for key in payos_config_required)
        
        if has_payos_config and app.config['PAYOS_CLIENT_ID'] not in ['', 'dummy_client_id']:
            payos_client = PayOS(
                client_id=app.config['PAYOS_CLIENT_ID'],
                api_key=app.config['PAYOS_API_KEY'],
                checksum_key=app.config['PAYOS_CHECKSUM_KEY']
            )
            app.payos_client = payos_client
            logger.info("PayOS initialized successfully")
        else:
            app.payos_client = None
            logger.info("PayOS not configured - using dummy mode")
            
    except Exception as e:
        logger.warning(f"PayOS initialization failed: {str(e)}")
        app.payos_client = None

    # =====================================================
    # REGISTER API BLUEPRINTS - IMPORT TRỰC TIẾP
    # =====================================================
    
    # IMPORT TRONG FUNCTION ĐỂ TRÁNH CIRCULAR IMPORT
    with app.app_context():
        from .routes.auth_routes import auth_api
        from .routes.sanpham_routes import product_api
        from .routes.upload_routes import upload_api
        from .routes.danhmuc_routes import danhmuc_api
        from .routes.thuonghieu_routes import thuonghieu_api
        from .routes.capdo_routes import capdo_api
        from .routes.diachi_routes import dia_chi_api
        from .routes.phieu_thu_routes import phieu_thu_api
        from .routes.giohang_routes import giohang_api
        from .routes.thanhtoan_routes import thanhtoan_api

        # ĐĂNG KÝ BLUEPRINTS
        app.register_blueprint(auth_api, url_prefix='/api/auth')
        app.register_blueprint(product_api, url_prefix='/api/san-pham')
        app.register_blueprint(upload_api, url_prefix='/api/upload')
        app.register_blueprint(danhmuc_api, url_prefix='/api/danh-muc')
        app.register_blueprint(thuonghieu_api, url_prefix='/api/thuong-hieu')
        app.register_blueprint(capdo_api, url_prefix='/api/cap-do')
        app.register_blueprint(dia_chi_api, url_prefix='/api/dia-chi')
        app.register_blueprint(phieu_thu_api, url_prefix='/api/phieu-thu')
        app.register_blueprint(giohang_api, url_prefix='/api/gio-hang')
        app.register_blueprint(thanhtoan_api, url_prefix='/api/thanh-toan')

        logger.info("All blueprints registered successfully")

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