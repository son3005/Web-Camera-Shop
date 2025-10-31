from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_pydantic_spec import FlaskPydanticSpec
from flask_mail import Mail
from celery import Celery
import bcrypt  # DÙNG bcrypt THUẦN

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
spec = FlaskPydanticSpec()
celery = Celery()
mail = Mail()

# Export bcrypt
__all__ = ['db', 'migrate', 'jwt', 'cors', 'spec', 'celery', 'mail', 'bcrypt']