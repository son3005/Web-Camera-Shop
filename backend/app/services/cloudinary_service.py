# /backend/app/services/cloudinary_service.py
import cloudinary
import cloudinary.uploader
from ..extensions import celery
import logging 

logger = logging.getLogger(__name__)  

class CloudinaryService:

    @staticmethod
    @celery.task(bind=True, max_retries=3, default_retry_delay=60)
    def delete_image_task(self, public_id: str):
        """
        Xóa một ảnh khỏi Cloudinary bằng public_id.
        Sẽ tự động thử lại 3 lần nếu thất bại.
        """
        if not public_id:
            logger.info("Bỏ qua việc xóa: không có public_id.")  # SỬA: logging.info
            return

        try:
            logger.info(f"Đang xóa ảnh {public_id} khỏi Cloudinary...")  # SỬA
            # Dùng API 'destroy' của Cloudinary
            result = cloudinary.uploader.destroy(public_id)
            
            if result.get("result") == "ok" or result.get("result") == "not found":
                logger.info(f"Đã xóa thành công {public_id}.")  # SỬA
                return f"Đã xóa {public_id}"
            else:
                raise Exception(f"Lỗi từ Cloudinary: {result.get('result')}")

        except Exception as exc:
            logger.error(f"Xóa {public_id} thất bại. Thử lại sau. Lỗi: {exc}")  # SỬA: logging.error
            self.retry(exc=exc)