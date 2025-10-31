# /backend/app/routes/upload_routes.py

from flask import Blueprint, jsonify, request
from ..utils.decorators import admin_required
from ..extensions import spec
from flask_pydantic_spec import Response, Request
from pydantic import BaseModel, Field
import logging  # THÊM: Logging

logger = logging.getLogger(__name__)  # THÊM

# Import service
from ..services.upload_service import UploadService

upload_api = Blueprint('upload_api', __name__, url_prefix='/api/upload')

# --- Schemas ---
class SignatureRequest(BaseModel):  # Thêm request schema
    folder: str = Field("san_pham", description="Thư mục upload (default: san_pham)")

class SignatureResponse(BaseModel):
    """Response cho việc lấy chữ ký upload."""
    signature: str = Field(..., description="Chữ ký đã được tạo")
    timestamp: int = Field(..., description="Dấu thời gian (UNIX)")
    api_key: str = Field(..., description="API Key của Cloudinary")
    folder: str = Field(..., description="Thư mục upload trên Cloudinary")

class UploadResponse(BaseModel):
    """Response cho việc upload trực tiếp qua server."""
    message: str = Field(default="Upload thành công!")
    url: str = Field(..., description="URL an toàn (https) của ảnh")
    public_id: str = Field(..., description="ID định danh file trên Cloudinary")

class ErrorResponse(BaseModel):
    error: str = Field(..., description="Lỗi chi tiết")

# --- Routes ---

@upload_api.route('/signature', methods=['POST'])
@admin_required
@spec.validate(body=Request(SignatureRequest), resp=Response(HTTP_200=SignatureResponse, HTTP_500=ErrorResponse), tags=['Upload'])
def get_upload_signature():
    """
    (Khuyên dùng) Lấy chữ ký cho phép React upload thẳng lên Cloudinary.
    Body JSON: {"folder": "mach_anh"} (tùy chọn).
    """
    try:
        data = SignatureRequest(**request.get_json() or {})
        signature_data = UploadService.generate_signature(folder=data.folder)
        return jsonify(signature_data), 200

    except Exception as e:
        logger.error(str(e))  # SỬA: Logging error
        return jsonify(ErrorResponse(error=str(e)).dict()), 500

@upload_api.route('/image', methods=['POST'])
@admin_required
@spec.validate(resp=Response(HTTP_201=UploadResponse, HTTP_400=ErrorResponse, HTTP_500=ErrorResponse), tags=['Upload'])
def upload_product_image_direct():
    """
    (Fallback) Upload một file ảnh qua server Flask.
    Frontend gửi 'multipart/form-data' với key là 'file'.
    Chỉ hỗ trợ jpg/png/jpeg.
    """
    if 'file' not in request.files:
        return jsonify(ErrorResponse(error="Không tìm thấy file trong request").dict()), 400
    
    file_to_upload = request.files['file']
    
    if file_to_upload.filename == '':
        return jsonify(ErrorResponse(error="Chưa chọn file để upload").dict()), 400

    # Validate file type (security)
    allowed_extensions = {'png', 'jpg', 'jpeg'}
    if not '.' in file_to_upload.filename or file_to_upload.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify(ErrorResponse(error="Chỉ hỗ trợ PNG/JPG/JPEG").dict()), 400

    try:
        # Gọi service (folder default)
        upload_data = UploadService.upload_direct_to_server(file_to_upload)
        
        return jsonify(UploadResponse(
            message="Upload thành công!",
            url=upload_data.get('url'),
            public_id=upload_data.get('public_id')
        ).dict()), 201

    except Exception as e:
        logger.error(str(e))  # SỬA: Logging error
        return jsonify(ErrorResponse(error=str(e)).dict()), 500