# /backend/app/services/cloudinary_service.py
import cloudinary
import cloudinary.uploader
from app.extensions import celery

class CloudinaryService:

    @staticmethod
    @celery.task(bind=True, max_retries=3, default_retry_delay=60)
    def delete_image_task(self, public_id: str):
        """
        Xóa một ảnh khỏi Cloudinary bằng public_id.
        Sẽ tự động thử lại 3 lần nếu thất bại.
        """
        if not public_id:
            print("Bỏ qua việc xóa: không có public_id.")
            return

        try:
            print(f"Đang xóa ảnh {public_id} khỏi Cloudinary...")
            # Dùng API 'destroy' của Cloudinary
            result = cloudinary.uploader.destroy(public_id)
            
            if result.get("result") == "ok" or result.get("result") == "not found":
                print(f"Đã xóa thành công {public_id}.")
                return f"Đã xóa {public_id}"
            else:
                raise Exception(f"Lỗi từ Cloudinary: {result.get('result')}")

        except Exception as exc:
            print(f"Xóa {public_id} thất bại. Thử lại sau. Lỗi: {exc}")
            self.retry(exc=exc)