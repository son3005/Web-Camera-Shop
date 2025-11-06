from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from ..extensions import db
from ..schemas.sanpham import (
    DanhMucCreate, 
    DanhMucUpdate, 
    DanhMucResponse,
    DanhMucListResponse
)
from ..services.danhmuc_service import DanhMucService

# Tạo Blueprint cho routes danh mục
danhmuc_api = Blueprint('danh_muc', __name__, url_prefix='/api/danh-muc')

@danhmuc_api.route('/', methods=['GET'])
def get_all_danh_muc():
    """Lấy danh sách tất cả danh mục với phân trang"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        skip = (page - 1) * per_page
        
        service = DanhMucService(db.session)
        danh_mucs = service.get_all(skip=skip, limit=per_page)
        total = service.count()
        
        danh_muc_list = [DanhMucResponse.model_validate(danh_muc) for danh_muc in danh_mucs]
        
        response = DanhMucListResponse(
            data=danh_muc_list,
            pagination={
                'page': page,
                'per_page': per_page,
                'total': total,
                'pages': (total + per_page - 1) // per_page
            }
        )
        
        return jsonify(response.model_dump()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@danhmuc_api.route('/<int:danh_muc_id>', methods=['GET'])
def get_danh_muc_by_id(danh_muc_id: int):
    """Lấy thông tin chi tiết danh mục theo ID"""
    try:
        service = DanhMucService(db.session)
        danh_muc = service.get_by_id(danh_muc_id)
        
        if not danh_muc:
            return jsonify({'error': 'Danh mục không tồn tại'}), 404
            
        return jsonify(DanhMucResponse.model_validate(danh_muc).model_dump()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@danhmuc_api.route('/', methods=['POST'])
# @jwt_required()
def create_danh_muc():
    """Tạo mới danh mục"""
    try:
        data = request.get_json()
        danh_muc_create = DanhMucCreate(**data)
        
        service = DanhMucService(db.session)
        new_danh_muc = service.create(danh_muc_create)
        
        return jsonify(DanhMucResponse.model_validate(new_danh_muc).model_dump()), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@danhmuc_api.route('/<int:danh_muc_id>', methods=['PUT'])
# @jwt_required()
def update_danh_muc(danh_muc_id: int):
    """Cập nhật thông tin danh mục"""
    try:
        data = request.get_json()
        danh_muc_update = DanhMucUpdate(**data)
        
        service = DanhMucService(db.session)
        updated_danh_muc = service.update(danh_muc_id, danh_muc_update)
        
        if not updated_danh_muc:
            return jsonify({'error': 'Danh mục không tồn tại'}), 404
            
        return jsonify(DanhMucResponse.model_validate(updated_danh_muc).model_dump()), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@danhmuc_api.route('/<int:danh_muc_id>', methods=['DELETE'])
# @jwt_required()
def delete_danh_muc(danh_muc_id: int):
    """Xóa danh mục - CHỈ CHO PHÉP NẾU KHÔNG CÓ SẢN PHẨM NÀO SỬ DỤNG"""
    try:
        service = DanhMucService(db.session)
        success = service.delete(danh_muc_id)
        
        if not success:
            return jsonify({'error': 'Danh mục không tồn tại'}), 404
            
        return jsonify({'message': 'Xóa danh mục thành công'}), 200
        
    except ValueError as e:
        # Lỗi khi có sản phẩm đang sử dụng
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@danhmuc_api.route('/<int:danh_muc_id>/kiem-tra-su-dung', methods=['GET'])
def kiem_tra_su_dung_danh_muc(danh_muc_id: int):
    """Kiểm tra xem danh mục có đang được sử dụng bởi sản phẩm nào không"""
    try:
        service = DanhMucService(db.session)
        kiem_tra_result = service.kiem_tra_su_dung(danh_muc_id)
        
        return jsonify(kiem_tra_result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500