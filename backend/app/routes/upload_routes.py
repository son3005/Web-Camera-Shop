import logging
import traceback
from flask import jsonify, request
from flask_openapi3 import APIBlueprint
from pydantic import BaseModel, Field
from ..utils.decorators import admin_required
from ..services.upload_service import UploadService

logger = logging.getLogger(__name__)

upload_api = APIBlueprint('upload_api', __name__, url_prefix='/api/upload')


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


@upload_api.post('/image', responses={"201": UploadResponse, "400": ErrorResponse, "500": ErrorResponse})
@admin_required
def upload_product_image_direct():
    """
    upload_routes.py

    Định nghĩa các route liên quan đến việc upload ảnh sản phẩm cho hệ thống web camera shop.

    Các chức năng chính:
    - Cung cấp endpoint POST '/image' cho phép admin upload ảnh sản phẩm trực tiếp lên server.
    - Kiểm tra sự tồn tại và hợp lệ của file ảnh được gửi lên (chỉ chấp nhận các định dạng: png, jpg, jpeg, webp).
    - Xử lý upload file thông qua UploadService, trả về đường dẫn ảnh và public_id nếu thành công.
    - Xử lý các trường hợp lỗi như: không tìm thấy file, file không hợp lệ, lỗi trong quá trình upload hoặc lỗi máy chủ.
    - Đảm bảo chỉ admin mới có quyền sử dụng endpoint này thông qua decorator @admin_required.
    """
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