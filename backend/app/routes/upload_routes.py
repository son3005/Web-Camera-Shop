import logging
import traceback
from flask import jsonify, request
from flask_openapi3 import APIBlueprint
from pydantic import BaseModel, Field
from ..utils.decorators import admin_required
from ..services.upload_service import UploadService

logger = logging.getLogger(__name__)

# ==============================================================
# Khởi tạo APIBlueprint (flask-openapi3)
# ==============================================================
upload_api = APIBlueprint('upload_api', __name__, url_prefix='/api/upload')


# ==============================================================
# SCHEMAS
# ==============================================================
class SignatureRequest(BaseModel):
    folder: str = Field("san_pham", description="Thư mục trên Cloudinary")


class SignatureResponse(BaseModel):
    signature: str
    timestamp: int
    api_key: str
    folder: str


class UploadResponse(BaseModel):
    message: str = Field("Upload thành công!")
    url: str
    public_id: str


class ErrorResponse(BaseModel):
    error: str


# ==============================================================
# 1️⃣ LẤY CHỮ KÝ UPLOAD (React → Cloudinary)
# ==============================================================
@upload_api.post('/signature', responses={"200": SignatureResponse, "500": ErrorResponse})
@admin_required
def get_upload_signature(body: SignatureRequest):  # ← Giữ param 'body: Model'
    """Sinh chữ ký upload Cloudinary (client dùng chữ ký này để upload trực tiếp)."""
    try:
        signature_data = UploadService.generate_signature(folder=body.folder)
        response = SignatureResponse.model_validate(signature_data)
        return jsonify(response.model_dump()), 200
    except Exception:
        logger.error(f"Lỗi tạo chữ ký: {traceback.format_exc()}")
        return jsonify(ErrorResponse(error="Không thể tạo chữ ký upload.").model_dump()), 500


# ==============================================================
# 2️⃣ UPLOAD TRỰC TIẾP QUA SERVER (Fallback)
# ==============================================================
@upload_api.post('/image', responses={"201": UploadResponse, "400": ErrorResponse, "500": ErrorResponse})
@admin_required
def upload_product_image_direct():
    """Upload file trực tiếp qua server (fallback khi Cloudinary client fail)."""
    if 'file' not in request.files:
        return jsonify(ErrorResponse(error="Không tìm thấy file").model_dump()), 400

    file = request.files['file']
    if not file.filename:
        return jsonify(ErrorResponse(error="Chưa chọn file").model_dump()), 400

    allowed = {'png', 'jpg', 'jpeg', 'webp'}
    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    if ext not in allowed:
        return jsonify(ErrorResponse(error=f"Chỉ hỗ trợ: {', '.join(allowed)}").model_dump()), 400

    try:
        result = UploadService.upload_direct_to_server(file)
        response = UploadResponse(url=result['secure_url'], public_id=result['public_id'])
        return jsonify(response.model_dump()), 201
    except ValueError as e:
        return jsonify(ErrorResponse(error=str(e)).model_dump()), 400
    except Exception:
        logger.error(f"Lỗi upload ảnh: {traceback.format_exc()}")
        return jsonify(ErrorResponse(error="Lỗi máy chủ khi upload ảnh").model_dump()), 500