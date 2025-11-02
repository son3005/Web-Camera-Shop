# /backend/app/services/cloudinary_service.py

import cloudinary
import cloudinary.uploader
from celery import shared_task
import logging 

logger = logging.getLogger(__name__)

# === 1. Class để import ở models (giữ lại) ===
class CloudinaryService:
    @staticmethod
    @shared_task(bind=True, max_retries=3, default_retry_delay=60)
    def delete_image_task(self, public_id: str):
        """
        Xóa một ảnh khỏi Cloudinary bằng public_id.
        """
        if not public_id:
            logger.info("Bỏ qua việc xóa: không có public_id.")
            return

        try:
            logger.info(f"Đang xóa ảnh {public_id} khỏi Cloudinary...")
            result = cloudinary.uploader.destroy(public_id)

            if result.get("result") in ["ok", "not found"]:
                logger.info(f"Đã xóa thành công {public_id}.")
                return f"Đã xóa {public_id}"
            else:
                raise Exception(f"Lỗi từ Cloudinary: {result.get('result')}")

        except Exception as exc:
            logger.error(f"Xóa {public_id} thất bại. Thử lại sau. Lỗi: {exc}")
            raise self.retry(exc=exc)