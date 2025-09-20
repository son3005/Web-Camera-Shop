from flask import Flask
from .config import Config
from .extensions import db, cors
from .routes.auth_routes import bp as auth_bp
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    with app.app_context():
        # register blueprints
        app.register_blueprint(auth_bp)
        # tạo bảng nếu chưa có (chỉ dùng dev)
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
