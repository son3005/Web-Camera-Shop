# /backend/app/routes/upload_routes.py

from flask import Blueprint, request, jsonify
import cloudinary
import cloudinary.uploader
from app.utils.decorators import admin_required # Import decorator đã tạo
from app.extensions import spec
from flask_pydantic_spec import Response
from pydantic import BaseModel, Field

# Tạo một blueprint mới cho việc upload
upload_api = Blueprint('upload_api', __name__, url_prefix='/api/upload')

# Định nghĩa Pydantic schema cho response trả về
class UploadResponse(BaseModel):
    message: str = Field(default="Upload thành công!")
    url: str = Field(..., description="URL an toàn (https) của ảnh đã được upload")

@upload_api.route('/image', methods=['POST'])
@admin_required() # Chỉ có admin mới được upload ảnh sản phẩm
@spec.validate(resp=Response(HTTP_201=UploadResponse), tags=['Upload'])
def upload_product_image():
    """
    Endpoint để upload một file ảnh lên Cloudinary cho sản phẩm.
    Frontend phải gửi file dưới dạng 'multipart/form-data' với key là 'file'.
    """
    # 1. Kiểm tra xem có file nào được gửi lên không
    if 'file' not in request.files:
        return jsonify(error="Không tìm thấy file trong request"), 400
    
    file_to_upload = request.files['file']
    
    # 2. Kiểm tra nếu người dùng không chọn file (tên file rỗng)
    if file_to_upload.filename == '':
        return jsonify(error="Chưa chọn file để upload"), 400

    try:
        # 3. Thực hiện upload lên Cloudinary
        # 'folder' giúp bạn tổ chức ảnh gọn gàng trên Cloudinary
        upload_result = cloudinary.uploader.upload(
            file_to_upload,
            folder="san_pham" # Ví dụ: lưu tất cả ảnh sản phẩm vào thư mục 'san_pham'
        )
        
        # 4. Trả về response thành công với URL an toàn (https)
        # Pydantic sẽ tự động validate response này theo schema UploadResponse
        return jsonify({
            "message": "Upload thành công!",
            "url": upload_result.get('secure_url')
        }), 201

    except Exception as e:
        # 5. Xử lý nếu có lỗi từ Cloudinary hoặc các lỗi khác
        return jsonify(error=f"Lỗi khi upload: {str(e)}"), 500