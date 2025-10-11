from app.main import create_app
from celery import Celery # pyright: ignore[reportMissingImports]
import os

# Tạo một instance Flask tạm thời để Celery có thể đọc config
flask_app = create_app(os.getenv('FLASK_CONFIG') or 'app.config.Config')

# Hàm tạo instance Celery
def make_celery(app):
    celery = Celery(
        app.import_name,
        broker=app.config['CELERY_BROKER_URL'],
        backend=app.config['CELERY_RESULT_BACKEND']
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

# Tạo instance Celery chính mà dự án sẽ sử dụng
celery_app = make_celery(flask_app)