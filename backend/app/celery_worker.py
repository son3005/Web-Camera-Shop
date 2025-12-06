# backend/app/celery_worker.py
import os
import json
from datetime import datetime
from .extensions import redis, db

# ĐẶT BIẾN MÔI TRƯỜNG TRƯỚC KHI IMPORT
os.environ.setdefault('FLASK_APP', 'app.main:create_app')
os.environ.setdefault('FLASK_ENV', 'development')

from app.main import create_app
from app.config import DevelopmentConfig
from .services.kho_service import KhoService
from .models.redis_models import DonHangAoResponse

# TẠO APP VÀ CELERY
flask_app = create_app(DevelopmentConfig)
celery_app = flask_app.extensions["celery"]

# TẠO TASKS SAU KHI CELERY ĐƯỢC KHỞI TẠO
@celery_app.task
def test_task():
    return "Celery is working!"


@celery_app.task
def kiem_tra_don_hang_ao_het_han():
    """Task định kỳ kiểm tra và xóa đơn hàng ảo hết hạn"""
    with flask_app.app_context():
        try:
            # Sử dụng trực tiếp Redis và KhoService thay vì DonHangAoService
            kho_service = KhoService(redis, db)
            
            flask_app.logger.info("🔍 Đang kiểm tra đơn hàng ảo hết hạn...")
            
            if not redis.ping():
                flask_app.logger.error("❌ Không thể kết nối đến Redis")
                return
            
            pattern = "donhang_ao:*"
            keys = redis.keys(pattern)
            
            deleted_count = 0
            for key in keys:
                try:
                    # Lấy dữ liệu đơn hàng ảo
                    don_ao_data = redis.get(key)
                    if don_ao_data:
                        don_ao = DonHangAoResponse(**json.loads(don_ao_data))
                        
                        # Kiểm tra nếu đơn hàng đã hết hạn
                        if datetime.now() > don_ao.thoi_gian_het_han:
                            flask_app.logger.info(f"🗑️ Đơn hàng ảo hết hạn: {don_ao.id}")
                            
                            # Giải phóng lock số lượng kho
                            if hasattr(don_ao, 'items_enriched') and don_ao.items_enriched:
                                kho_service.giai_phong_lock(don_ao.items_enriched)
                            
                            # Xóa đơn hàng ảo khỏi Redis
                            redis.delete(key)
                            deleted_count += 1
                            
                except Exception as e:
                    flask_app.logger.error(f"❌ Lỗi xử lý đơn hàng ảo {key}: {e}")
                    continue
            
            if deleted_count > 0:
                flask_app.logger.info(f"✅ Đã xóa {deleted_count} đơn hàng ảo hết hạn")
            else:
                flask_app.logger.info("✅ Không có đơn hàng ảo hết hạn")
                
        except Exception as e:
            flask_app.logger.error(f"❌ Lỗi khi kiểm tra đơn hàng ảo: {e}")

# Cập nhật beat schedule
celery_app.conf.beat_schedule = {
    'test-every-30-seconds': {
        'task': 'app.celery_worker.test_task',
        'schedule': 30.0, # Chạy mỗi 30 giây
    },
    'kiem-tra-don-hang-ao-het-han': {
        'task': 'app.celery_worker.kiem_tra_don_hang_ao_het_han',
        'schedule': 60.0, # Chạy mỗi 60 giây
    },
}