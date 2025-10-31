# /backend/app/run.py
from dotenv import load_dotenv
load_dotenv()

from app.main import create_app
import os

# Xác định môi trường
flask_env = os.getenv('FLASK_ENV', 'development').lower()

if flask_env == 'production':
    from app.config import ProductionConfig
    config_class = ProductionConfig
elif flask_env == 'testing':
    from app.config import TestingConfig
    config_class = TestingConfig
else:
    from app.config import DevelopmentConfig
    config_class = DevelopmentConfig

app = create_app(config_class)

if __name__ == "__main__":
    app.run(
        debug=config_class.DEBUG,
        host='0.0.0.0',
        port=5000
    )