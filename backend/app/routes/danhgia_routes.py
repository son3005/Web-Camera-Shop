# /backend/app/routes/danhgia_routes.py
from venv import logger
from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_openapi3 import APIBlueprint

from ..services.danhgia_service import DanhGiaService
from ..schemas.extras import DanhGiaCreate, DanhGiaUpdate, DanhGiaResponse  # SỬA IMPORT
from ..models.enums import TrangThaiDanhGiaEnum

from pydantic import BaseModel
# Khởi tạo blueprint
class PathSanPhamID(BaseModel):
    san_pham_id: int

class PathDanhGiaID(BaseModel):
    danh_gia_id: int


danh_gia_api = APIBlueprint('danh_gia', __name__, url_prefix='/api/danh-gia')

@danh_gia_api.get('/san-pham/<int:san_pham_id>')
def get_danh_gia_san_pham(path: PathSanPhamID):  # SỬA: DÙNG path PARAMETER
    """
    Lấy danh sách đánh giá của sản phẩm với bộ lọc nâng cao
    """
    try:
        # Lấy san_pham_id từ path parameters
        san_pham_id = path.san_pham_id
        if not san_pham_id:
            return jsonify({'error': 'Thiếu ID sản phẩm'}), 400
            
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Xử lý bộ lọc
        filters = {}
        
        # Lọc theo điểm đánh giá
        diem_danh_gia = request.args.get('diem_danh_gia')
        if diem_danh_gia:
            if diem_danh_gia.startswith('[') and diem_danh_gia.endswith(']'):
                # Mảng điểm: [4,5]
                try:
                    filters['diem_danh_gia'] = [int(x.strip()) for x in diem_danh_gia[1:-1].split(',')]
                except:
                    filters['diem_danh_gia'] = int(diem_danh_gia)
            else:
                filters['diem_danh_gia'] = int(diem_danh_gia)
        
        # Lọc theo thời gian
        tu_ngay = request.args.get('tu_ngay')
        den_ngay = request.args.get('den_ngay')
        if tu_ngay:
            filters['tu_ngay'] = tu_ngay
        if den_ngay:
            filters['den_ngay'] = den_ngay
            
        # Lọc theo có bình luận
        co_binh_luan = request.args.get('co_binh_luan')
        if co_binh_luan in ['true', 'false']:
            filters['co_binh_luan'] = co_binh_luan == 'true'
        
        danh_gias, pagination = DanhGiaService.get_danh_gia_san_pham(
            san_pham_id=san_pham_id,
            filters=filters,
            page=page,
            per_page=per_page
        )
        
        return jsonify({
            'data': [DanhGiaResponse.from_orm(dg).dict() for dg in danh_gias],
            'pagination': pagination
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@danh_gia_api.get('/san-pham/<int:san_pham_id>/thong-ke')
def get_thong_ke_danh_gia_san_pham(path: PathSanPhamID):  # SỬA: DÙNG path PARAMETER
    """
    Lấy thống kê đánh giá theo sao của sản phẩm
    """
    try:
        san_pham_id = path.san_pham_id
        if not san_pham_id:
            return jsonify({'error': 'Thiếu ID sản phẩm'}), 400
            
        thong_ke = DanhGiaService.get_thong_ke_danh_gia(san_pham_id=san_pham_id)
        return jsonify(thong_ke), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@danh_gia_api.get('/cua-toi')
@jwt_required()
def get_danh_gia_cua_toi():
    """
    Lấy danh sách đánh giá của người dùng hiện tại với bộ lọc
    """
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Xử lý bộ lọc
        filters = {}
        
        diem_danh_gia = request.args.get('diem_danh_gia')
        if diem_danh_gia:
            if diem_danh_gia.startswith('[') and diem_danh_gia.endswith(']'):
                try:
                    filters['diem_danh_gia'] = [int(x.strip()) for x in diem_danh_gia[1:-1].split(',')]
                except:
                    filters['diem_danh_gia'] = int(diem_danh_gia)
            else:
                filters['diem_danh_gia'] = int(diem_danh_gia)
        
        tu_ngay = request.args.get('tu_ngay')
        den_ngay = request.args.get('den_ngay')
        if tu_ngay:
            filters['tu_ngay'] = tu_ngay
        if den_ngay:
            filters['den_ngay'] = den_ngay
            
        co_binh_luan = request.args.get('co_binh_luan')
        if co_binh_luan in ['true', 'false']:
            filters['co_binh_luan'] = co_binh_luan == 'true'
        
        danh_gias, pagination = DanhGiaService.get_danh_gia_cua_toi(
            nguoi_dung_id=current_user_id,
            filters=filters,
            page=page,
            per_page=per_page
        )
        
        return jsonify({
            'data': [DanhGiaResponse.from_orm(dg).dict() for dg in danh_gias],
            'pagination': pagination
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@danh_gia_api.post('')
@jwt_required()
def create_danh_gia(body: DanhGiaCreate):
    """
    Tạo đánh giá mới
    """
    try:
        logger.info("Creating a new danh gia")
        current_user_id = get_jwt_identity()
        
        danh_gia = DanhGiaService.create_danh_gia(
            danh_gia_data=body,
            nguoi_dung_id=current_user_id
        )
        
        return DanhGiaResponse.from_orm(danh_gia).dict(), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Lỗi hệ thống'}), 500

@danh_gia_api.put('/<int:danh_gia_id>')
@jwt_required()
def update_danh_gia(path: PathDanhGiaID, body: DanhGiaUpdate):  # SỬA: THÊM path PARAMETER
    """
    Cập nhật đánh giá của chính mình
    """
    try:
        danh_gia_id = path.danh_gia_id
        if not danh_gia_id:
            return jsonify({'error': 'Thiếu ID đánh giá'}), 400
            
        current_user_id = get_jwt_identity()
        
        danh_gia = DanhGiaService.update_danh_gia(
            danh_gia_id=danh_gia_id,
            update_data=body,
            nguoi_dung_id=current_user_id
        )
        
        if not danh_gia:
            return jsonify({'error': 'Đánh giá không tồn tại'}), 404
            
        return DanhGiaResponse.from_orm(danh_gia).dict(), 200
        
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        return jsonify({'error': 'Lỗi hệ thống'}), 500

@danh_gia_api.delete('/<int:danh_gia_id>')
@jwt_required()
def delete_danh_gia(path: PathDanhGiaID):  
    """
    Xóa đánh giá của chính mình
    """
    try:
        danh_gia_id = path.danh_gia_id
        if not danh_gia_id:
            return jsonify({'error': 'Thiếu ID đánh giá'}), 400
            
        current_user_id = get_jwt_identity()
        
        success = DanhGiaService.delete_danh_gia(
            danh_gia_id=danh_gia_id,
            nguoi_dung_id=current_user_id,
        )
        
        if not success:
            return jsonify({'error': 'Đánh giá không tồn tại'}), 404
            
        return jsonify({'message': 'Xóa đánh giá thành công'}), 200
        
    except PermissionError as e:
        return jsonify({'error': str(e)}), 403
    except Exception as e:
        return jsonify({'error': 'Lỗi hệ thống'}), 500