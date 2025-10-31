# /backend/app/services/upload_service.py
import cloudinary
import cloudinary.uploader
import cloudinary.utils
import time
from typing import Dict, Any
from werkzeug.datastructures import FileStorage
import logging  # THÊM: Logging

logger = logging.getLogger(__name__)  # THÊM

class UploadService:
    """
    Chứa logic nghiệp vụ cho việc upload và quản lý file trên Cloudinary.
    """

    @staticmethod
    def generate_signature(folder: str = "san_pham") -> Dict[str, Any]:
        """
        Tạo chữ ký (signed signature) cho phép React
        upload thẳng lên Cloudinary mà không cần qua server.
        """
        try:
            timestamp = int(time.time())
            config = cloudinary.config()

            if not config.api_secret:
                raise Exception("Chưa cấu hình Cloudinary API Secret")

            # Tạo payload để ký
            payload_to_sign = {
                "timestamp": timestamp,
                "folder": folder
            }
            
            # Ký payload
            signature = cloudinary.utils.api_sign_request(
                payload_to_sign, 
                config.api_secret
            )

            return {
                "signature": signature,
                "timestamp": timestamp,
                "api_key": config.api_key,
                "folder": folder
            }

        except Exception as e:
            logger.error(f"Lỗi khi tạo signature: {str(e)}")  # SỬA: logging.error
            raise Exception(f"Không thể tạo chữ ký upload: {str(e)}")

    @staticmethod
    def upload_direct_to_server(file: FileStorage, folder: str = "san_pham") -> Dict[str, str]:
        """
        Upload file trực tiếp qua server Flask (dùng làm fallback).
        """
        try:
            # THÊM: Optional check size (nếu muốn)
            # file.seek(0, 2)  # Di chuyển đến end
            # size = file.tell()
            # file.seek(0)  # Reset
            # if size > 5 * 1024 * 1024:  # >5MB
            #     raise Exception("File quá lớn (>5MB)")

            # Thực hiện upload lên Cloudinary
            upload_result = cloudinary.uploader.upload(
                file,
                folder=folder
            )
            
            secure_url = upload_result.get('secure_url')
            public_id = upload_result.get('public_id')

            if not secure_url or not public_id:
                raise Exception("Upload lên Cloudinary thất bại, không có URL hoặc Public ID.")  # SỬA: Align indentation

            return {
                "url": secure_url,
                "public_id": public_id
            }

        except Exception as e:
            logger.error(f"Lỗi khi upload trực tiếp: {str(e)}")  # SỬA: logging.error
            raise Exception(f"Upload file thất bại: {str(e)}")