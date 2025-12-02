# /backend/app/services/upload_service.py
import cloudinary
import cloudinary.uploader
import cloudinary.utils
import time
from typing import Dict, Any
from werkzeug.datastructures import FileStorage
import logging

# THÊM: Logger riêng cho service
logger = logging.getLogger(__name__)


class UploadService:
    """
    Chứa logic nghiệp vụ cho việc upload và quản lý file trên Cloudinary.
    """

    @staticmethod
    def generate_signature(folder: str = "san_pham") -> Dict[str, Any]:
        """
        Tạo chữ ký (signed signature) cho phép React upload thẳng lên Cloudinary.
        """
        logger.info(f"Bắt đầu tạo signature upload | folder: '{folder}'")

        try:
            timestamp = int(time.time())
            config = cloudinary.config()

            # Kiểm tra cấu hình Cloudinary
            if not config.api_key:
                logger.error("Thiếu CLOUDINARY_API_KEY trong config")
                raise Exception("Thiếu CLOUDINARY_API_KEY")
            if not config.api_secret:
                logger.error("Thiếu CLOUDINARY_API_SECRET trong config")
                raise Exception("Chưa cấu hình Cloudinary API Secret")

            # Payload để ký
            payload_to_sign = {
                "timestamp": timestamp,
                "folder": folder
            }
            logger.debug(f"Payload ký: {payload_to_sign}")

            # Ký payload
            signature = cloudinary.utils.api_sign_request(
                payload_to_sign,
                config.api_secret
            )

            result = {
                "signature": signature,
                "timestamp": timestamp,
                "api_key": config.api_key,
                "folder": folder
            }

            logger.info("Tạo signature thành công")
            logger.debug(f"Signature result: {result}")
            return result

        except Exception as e:
            logger.error(f"Lỗi khi tạo signature: {str(e)}", exc_info=True)
            raise Exception(f"Không thể tạo chữ ký upload: {str(e)}")

    @staticmethod
    def upload_direct_to_server(file: FileStorage, folder: str = "san_pham") -> Dict[str, str]:
        """
        Upload file trực tiếp qua server Flask (dùng làm fallback).
        """
        if not file or not file.filename:
            logger.warning("File không hợp lệ hoặc không có tên")
            raise Exception("File không hợp lệ")

        logger.info(f"Bắt đầu upload file qua server | filename: '{file.filename}', folder: '{folder}'")

        try:
            # Tạo public_id unique với datetime + uuid 4 ký tự
            import uuid
            from datetime import datetime
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            unique_id = str(uuid.uuid4())[:4]  # 4 ký tự đầu của UUID
            
            
            # Tạo public_id unique: timestamp_uuid4_original_name
            unique_public_id = f"{timestamp}_{unique_id}"
            
            # Nếu có folder, thêm vào public_id
            if folder:
                unique_public_id = f"{unique_public_id}"

            # Upload lên Cloudinary
            logger.debug("Gửi request upload tới Cloudinary...")
            upload_result = cloudinary.uploader.upload(
                file,
                public_id=unique_public_id,
                use_filename=False,  # Sử dụng public_id của chúng ta
                unique_filename=False,
                overwrite=False,  # Không ghi đè
                resource_type="image",
                folder=folder
            )

            secure_url = upload_result.get('secure_url')
            public_id = upload_result.get('public_id')

            if not secure_url or not public_id:
                logger.error("Upload thất bại: Không nhận được URL hoặc public_id từ Cloudinary")
                raise Exception("Upload lên Cloudinary thất bại, không có URL hoặc Public ID.")

            logger.info(f"Upload thành công | public_id: {public_id}")
            return {
                "url": secure_url,
                "public_id": public_id
            }

        except cloudinary.exceptions.Error as ce:
            logger.error(f"Lỗi Cloudinary API: {ce}", exc_info=True)
            raise Exception(f"Cloudinary API error: {str(ce)}")
        except Exception as e:
            logger.error(f"Lỗi upload file: {str(e)}", exc_info=True)
            raise Exception(f"Upload file thất bại: {str(e)}")