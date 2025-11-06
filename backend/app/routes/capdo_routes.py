from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from ..extensions import db
from ..schemas.sanpham import (
    CapDoCreate, 
    CapDoUpdate, 
    CapDoResponse,
    CapDoListResponse
)
from ..services.capdo_service import CapDoService

# Tạo Blueprint cho routes cấp độ
capdo_api = Blueprint('cap_do', __name__, url_prefix='/api/cap-do')

@capdo_api.route('/', methods=['GET'])
def get_all_cap_do():
    """Lấy danh sách tất cả cấp độ với phân trang"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        skip = (page - 1) * per_page
        
        service = CapDoService(db.session)
        cap_dos = service.get_all(skip=skip, limit=per_page)
        total = service.count()
        
        # Chuyển đổi sang schema response
        cap_do_list = [CapDoResponse.model_validate(cap_do) for cap_do in cap_dos]
        
        response = CapDoListResponse(
            data=cap_do_list,
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

@capdo_api.route('/<int:cap_do_id>', methods=['GET'])
def get_cap_do_by_id(cap_do_id: int):
    """Lấy thông tin chi tiết cấp độ theo ID"""
    try:
        service = CapDoService(db.session)
        cap_do = service.get_by_id(cap_do_id)
        
        if not cap_do:
            return jsonify({'error': 'Cấp độ không tồn tại'}), 404
            
        return jsonify(CapDoResponse.model_validate(cap_do).model_dump()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@capdo_api.route('/', methods=['POST'])
# @jwt_required()
def create_cap_do():
    """Tạo mới cấp độ"""
    try:
        data = request.get_json()
        cap_do_create = CapDoCreate(**data)
        
        service = CapDoService(db.session)
        new_cap_do = service.create(cap_do_create)
        
        return jsonify(CapDoResponse.model_validate(new_cap_do).model_dump()), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@capdo_api.route('/<int:cap_do_id>', methods=['PUT'])
# @jwt_required()
def update_cap_do(cap_do_id: int):
    """Cập nhật thông tin cấp độ"""
    try:
        data = request.get_json()
        cap_do_update = CapDoUpdate(**data)
        
        service = CapDoService(db.session)
        updated_cap_do = service.update(cap_do_id, cap_do_update)
        
        if not updated_cap_do:
            return jsonify({'error': 'Cấp độ không tồn tại'}), 404
            
        return jsonify(CapDoResponse.model_validate(updated_cap_do).model_dump()), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@capdo_api.route('/<int:cap_do_id>', methods=['DELETE'])
# @jwt_required()
def delete_cap_do(cap_do_id: int):
    """Xóa cấp độ - CHỈ CHO PHÉP NẾU KHÔNG CÓ SẢN PHẨM NÀO SỬ DỤNG"""
    try:
        service = CapDoService(db.session)
        success = service.delete(cap_do_id)
        
        if not success:
            return jsonify({'error': 'Cấp độ không tồn tại'}), 404
            
        return jsonify({'message': 'Xóa cấp độ thành công'}), 200
        
    except ValueError as e:
        # Lỗi khi có sản phẩm đang sử dụng
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@capdo_api.route('/<int:cap_do_id>/kiem-tra-su-dung', methods=['GET'])
def kiem_tra_su_dung_cap_do(cap_do_id: int):
    """Kiểm tra xem cấp độ có đang được sử dụng bởi sản phẩm nào không"""
    try:
        service = CapDoService(db.session)
        kiem_tra_result = service.kiem_tra_su_dung(cap_do_id)
        
        return jsonify(kiem_tra_result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500