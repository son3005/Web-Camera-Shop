

from app.main import create_app
from app.config import DevelopmentConfig, ProductionConfig 
import os

config_name = os.getenv('FLASK_CONFIG', 'development')
if config_name == 'production':
    config = ProductionConfig()
else:
    config = DevelopmentConfig()

app = create_app(config)

if __name__ == "__main__":
    app.run(debug=config.DEBUG, host='0.0.0.0', port=5000)