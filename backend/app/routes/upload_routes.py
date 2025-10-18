# /backend/app/routes/upload_routes.py

from flask import Blueprint, jsonify
import cloudinary
import cloudinary.api
import time
from app.utils.decorators import admin_required # Import decorator của bạn
from app.extensions import spec
from flask_pydantic_spec import Response
from pydantic import BaseModel, Field

upload_api = Blueprint('upload_api', __name__, url_prefix='/api/upload')

# Định nghĩa Pydantic schema cho response trả về
class SignatureResponse(BaseModel):
    signature: str = Field(..., description="Chữ ký đã được tạo")
    timestamp: int = Field(..., description="Dấu thời gian (UNIX)")
    api_key: str = Field(..., description="API Key của Cloudinary")
    folder: str = Field(..., description="Thư mục upload trên Cloudinary")

@upload_api.route('/signature', methods=['POST'])
@admin_required()
@spec.validate(resp=Response(HTTP_200=SignatureResponse), tags=['Upload'])
def get_upload_signature():
    """
    (CẢI TIẾN HIỆU NĂNG) Tạo chữ ký (signed signature) cho phép React
    upload file thẳng lên Cloudinary mà không cần đi qua server Flask.
    """
    try:
        timestamp = int(time.time())
        folder = "san_pham" # Thư mục upload

        config = cloudinary.config()
        if not config.api_secret:
            raise Exception("Chưa cấu hình Cloudinary API Secret")

        # Tạo payload để ký
        payload_to_sign = {
            "timestamp": timestamp,
            "folder": folder
        }
        
        signature = cloudinary.utils.api_sign_request(
            payload_to_sign, 
            config.api_secret
        )

        return jsonify({
            "signature": signature,
            "timestamp": timestamp,
            "api_key": config.api_key,
            "folder": folder
        }), 200

    except Exception as e:
        return jsonify(error=f"Không thể tạo chữ ký: {str(e)}"), 500