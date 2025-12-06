# app/routes/diachi_routes.py
import traceback
import logging
from flask import jsonify, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_openapi3 import APIBlueprint
from werkzeug.exceptions import BadRequest  # THÊM IMPORT NÀY

from ..extensions import db
from ..models import DiaChi
from ..services.diachi_service import DiaChiService, DiaChiNotFound
from ..schemas.nguoidung.DiaChi import (
    DiaChiCreate, 
    DiaChiUpdate, 
    DiaChiResponse,
    DiaChiListResponse,
    DeleteResponse,
    ErrorResponse,
    DiaChiPath,
    PaginationInfo
)

# Khởi tạo blueprint
dia_chi_api = APIBlueprint('dia_chi', __name__, url_prefix='/api/dia-chi')

logger = logging.getLogger(__name__)

# ==============================================================
# 1. LẤY DANH SÁCH ĐỊA CHỈ
# ==============================================================
@dia_chi_api.get('', responses={"200": DiaChiListResponse, "500": ErrorResponse})
@jwt_required()
def get_all_dia_chi():
    """
    Lấy danh sách địa chỉ của người dùng hiện tại với phân trang
    """
    try:
        nguoi_dung_id = get_jwt_identity()
        
        # Lấy tham số phân trang
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Validate tham số
        if page < 1 or per_page < 1 or per_page > 100:
            return jsonify(ErrorResponse(
                error="Tham số phân trang không hợp lệ",
                chi_tiet="page >= 1, per_page từ 1 đến 100"
            ).model_dump()), 400
        
        # Gọi service
        result = DiaChiService.get_all_dia_chi(
            nguoi_dung_id=nguoi_dung_id,
            page=page,
            per_page=per_page
        )
        
        # Tạo response object
        response = DiaChiListResponse(
            data=result["data"],
            pagination=PaginationInfo(**result["pagination"])
        )
        
        return jsonify(response.model_dump()), 200
        
    except Exception as e:
        logger.error(f"Lỗi lấy danh sách địa chỉ: {traceback.format_exc()}")
        return jsonify(ErrorResponse(
            error="Lỗi máy chủ khi lấy danh sách địa chỉ"
        ).model_dump()), 500

# ==============================================================
# 2. LẤY CHI TIẾT ĐỊA CHỈ
# ==============================================================
@dia_chi_api.get('/<int:dia_chi_id>', responses={"200": DiaChiResponse, "404": ErrorResponse, "500": ErrorResponse})
@jwt_required()
def get_dia_chi(path: DiaChiPath):
    """
    Lấy chi tiết địa chỉ theo ID
    """
    try:
        nguoi_dung_id = get_jwt_identity()
        
        dia_chi = DiaChiService.get_dia_chi_by_id(path.dia_chi_id, nguoi_dung_id)
        
        # Chuyển đổi sang response schema
        response = DiaChiResponse.model_validate(dia_chi)
        return jsonify(response.model_dump()), 200
        
    except DiaChiNotFound as e:
        return jsonify(ErrorResponse(error=str(e)).model_dump()), 404
    except Exception as e:
        logger.error(f"Lỗi lấy địa chỉ {path.dia_chi_id}: {traceback.format_exc()}")
        return jsonify(ErrorResponse(
            error="Lỗi máy chủ khi lấy địa chỉ"
        ).model_dump()), 500

# ==============================================================
# 3. TẠO ĐỊA CHỈ MỚI
# ==============================================================
@dia_chi_api.post('', responses={"201": DiaChiResponse, "400": ErrorResponse, "500": ErrorResponse})
@jwt_required()
def create_dia_chi(body: DiaChiCreate):
    """
    Tạo địa chỉ mới cho người dùng
    """
    try:
        nguoi_dung_id = get_jwt_identity()
        
        new_dia_chi = DiaChiService.create_dia_chi(body, nguoi_dung_id)
        
        # Chuyển đổi sang response schema
        response = DiaChiResponse.model_validate(new_dia_chi)
        return jsonify(response.model_dump()), 201
        
    except BadRequest as e:  # THÊM XỬ LÝ LỖI GIỚI HẠN 5 ĐỊA CHỈ
        return jsonify(ErrorResponse(error=str(e.description)).model_dump()), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Lỗi tạo địa chỉ: {traceback.format_exc()}")
        return jsonify(ErrorResponse(
            error=f"Không thể tạo địa chỉ: {str(e)}"
        ).model_dump()), 500

# ==============================================================
# 4. CẬP NHẬT ĐỊA CHỈ
# ==============================================================
@dia_chi_api.put('/<int:dia_chi_id>', responses={"200": DiaChiResponse, "404": ErrorResponse, "500": ErrorResponse})
@jwt_required()
def update_dia_chi(path: DiaChiPath, body: DiaChiUpdate):
    """
    Cập nhật thông tin địa chỉ
    """
    try:
        nguoi_dung_id = get_jwt_identity()
        
        updated_dia_chi = DiaChiService.update_dia_chi(path.dia_chi_id, body, nguoi_dung_id)
        
        # Chuyển đổi sang response schema
        response = DiaChiResponse.model_validate(updated_dia_chi)
        return jsonify(response.model_dump()), 200
        
    except DiaChiNotFound as e:
        return jsonify(ErrorResponse(error=str(e)).model_dump()), 404
    except BadRequest as e:  # THÊM XỬ LÝ LỖI
        return jsonify(ErrorResponse(error=str(e.description)).model_dump()), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Lỗi cập nhật địa chỉ {path.dia_chi_id}: {traceback.format_exc()}")
        return jsonify(ErrorResponse(
            error=f"Không thể cập nhật địa chỉ: {str(e)}"
        ).model_dump()), 500

# ==============================================================
# 5. XÓA ĐỊA CHỈ
# ==============================================================
@dia_chi_api.delete('/<int:dia_chi_id>', responses={"200": DeleteResponse, "404": ErrorResponse, "500": ErrorResponse})
@jwt_required()
def delete_dia_chi(path: DiaChiPath):
    """
    Xóa địa chỉ
    """
    try:
        nguoi_dung_id = get_jwt_identity()
        
        result = DiaChiService.delete_dia_chi(path.dia_chi_id, nguoi_dung_id)
        
        response = DeleteResponse(**result)
        return jsonify(response.model_dump()), 200
        
    except DiaChiNotFound as e:
        return jsonify(ErrorResponse(error=str(e)).model_dump()), 404
    except BadRequest as e:  # THÊM XỬ LÝ LỖI (ví dụ: xóa địa chỉ mặc định)
        return jsonify(ErrorResponse(error=str(e.description)).model_dump()), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Lỗi xóa địa chỉ {path.dia_chi_id}: {traceback.format_exc()}")
        return jsonify(ErrorResponse(
            error=f"Không thể xóa địa chỉ: {str(e)}"
        ).model_dump()), 500

# ==============================================================
# 6. ĐẶT ĐỊA CHỈ LÀM MẶC ĐỊNH
# ==============================================================
@dia_chi_api.patch('/<int:dia_chi_id>/mac-dinh', responses={"200": DiaChiResponse, "404": ErrorResponse, "500": ErrorResponse})
@jwt_required()
def set_mac_dinh(path: DiaChiPath):
    """
    Đặt địa chỉ làm mặc định
    """
    try:
        nguoi_dung_id = get_jwt_identity()
        
        dia_chi = DiaChiService.set_mac_dinh(path.dia_chi_id, nguoi_dung_id)
        
        # Chuyển đổi sang response schema
        response = DiaChiResponse.model_validate(dia_chi)
        return jsonify(response.model_dump()), 200
        
    except DiaChiNotFound as e:
        return jsonify(ErrorResponse(error=str(e)).model_dump()), 404
    except BadRequest as e:  # THÊM XỬ LÝ LỖI
        return jsonify(ErrorResponse(error=str(e.description)).model_dump()), 400
    except Exception as e:
        db.session.rollback()
        logger.error(f"Lỗi đặt địa chỉ mặc định {path.dia_chi_id}: {traceback.format_exc()}")
        return jsonify(ErrorResponse(
            error=f"Không thể đặt địa chỉ mặc định: {str(e)}"
        ).model_dump()), 500

# ==============================================================
# 7. LẤY ĐỊA CHỈ MẶC ĐỊNH
# ==============================================================
@dia_chi_api.get('/mac-dinh', responses={"200": DiaChiResponse, "404": ErrorResponse, "500": ErrorResponse})
@jwt_required()
def get_dia_chi_mac_dinh():
    """
    Lấy địa chỉ mặc định của người dùng
    """
    try:
        nguoi_dung_id = get_jwt_identity()
        
        dia_chi = DiaChi.query.filter_by(
            nguoi_dung_id=nguoi_dung_id,
            la_mac_dinh=True
        ).first()
        
        if not dia_chi:
            return jsonify(ErrorResponse(
                error="Không tìm thấy địa chỉ mặc định"
            ).model_dump()), 404
        
        response = DiaChiResponse.model_validate(dia_chi)
        return jsonify(response.model_dump()), 200
        
    except Exception as e:
        logger.error(f"Lỗi lấy địa chỉ mặc định: {traceback.format_exc()}")
        return jsonify(ErrorResponse(
            error="Lỗi máy chủ khi lấy địa chỉ mặc định"
        ).model_dump()), 500