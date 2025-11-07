# /app/app/extensions.py → SỬA
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mailman import Mail
from celery import Celery
from redis import Redis

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
redis = Redis()

mail = Mail()
celery = Celery()



__all__ = ['db', 'migrate', 'jwt', 'cors', 'mail', 'celery', 'redis']