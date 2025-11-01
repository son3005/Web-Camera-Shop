# /backend/app/celery_worker.py
import os
from app.main import create_app
from app.config import DevelopmentConfig  # ← THÊM DÒNG NÀY

# DÙNG CLASS, KHÔNG PHẢI STRING
flask_app = create_app(os.getenv("FLASK_CONFIG") or DevelopmentConfig)
celery_app = flask_app.extensions["celery"]