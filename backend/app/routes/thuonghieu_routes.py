from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from ..extensions import db
from ..schemas.sanpham import (
    ThuongHieuCreate, 
    ThuongHieuUpdate, 
    ThuongHieuResponse,
    ThuongHieuListResponse
)
from ..services.thuonghieu_service import ThuongHieuService
from ..utils.decorators import admin_required

# Tạo Blueprint cho routes thương hiệu
thuonghieu_api = Blueprint('thuong_hieu', __name__, url_prefix='/api/thuong-hieu')

@thuonghieu_api.route('/', methods=['GET'])
def get_all_thuong_hieu():
    """Lấy danh sách tất cả thương hiệu với phân trang"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        skip = (page - 1) * per_page
        
        service = ThuongHieuService(db.session)
        thuong_hieus = service.get_all(skip=skip, limit=per_page)
        total = service.count()
        
        thuong_hieu_list = [ThuongHieuResponse.model_validate(thuong_hieu) for thuong_hieu in thuong_hieus]
        
        response = ThuongHieuListResponse(
            data=thuong_hieu_list,
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

@thuonghieu_api.route('/<int:thuong_hieu_id>', methods=['GET'])
def get_thuong_hieu_by_id(thuong_hieu_id: int):
    """Lấy thông tin chi tiết thương hiệu theo ID"""
    try:
        service = ThuongHieuService(db.session)
        thuong_hieu = service.get_by_id(thuong_hieu_id)
        
        if not thuong_hieu:
            return jsonify({'error': 'Thương hiệu không tồn tại'}), 404
            
        return jsonify(ThuongHieuResponse.model_validate(thuong_hieu).model_dump()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@thuonghieu_api.route('/', methods=['POST'])
# @jwt_required()
@admin_required
def create_thuong_hieu():
    """Tạo mới thương hiệu"""
    try:
        data = request.get_json()
        thuong_hieu_create = ThuongHieuCreate(**data)
        
        service = ThuongHieuService(db.session)
        new_thuong_hieu = service.create(thuong_hieu_create)
        
        return jsonify(ThuongHieuResponse.model_validate(new_thuong_hieu).model_dump()), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@thuonghieu_api.route('/<int:thuong_hieu_id>', methods=['PUT'])
# @jwt_required()
@admin_required
def update_thuong_hieu(thuong_hieu_id: int):
    """Cập nhật thông tin thương hiệu"""
    try:
        data = request.get_json()
        thuong_hieu_update = ThuongHieuUpdate(**data)
        
        service = ThuongHieuService(db.session)
        updated_thuong_hieu = service.update(thuong_hieu_id, thuong_hieu_update)
        
        if not updated_thuong_hieu:
            return jsonify({'error': 'Thương hiệu không tồn tại'}), 404
            
        return jsonify(ThuongHieuResponse.model_validate(updated_thuong_hieu).model_dump()), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@thuonghieu_api.route('/<int:thuong_hieu_id>', methods=['DELETE'])
# @jwt_required()
@admin_required
def delete_thuong_hieu(thuong_hieu_id: int):
    """Xóa thương hiệu - CHỈ CHO PHÉP NẾU KHÔNG CÓ SẢN PHẨM NÀO SỬ DỤNG"""
    try:
        service = ThuongHieuService(db.session)
        success = service.delete(thuong_hieu_id)
        
        if not success:
            return jsonify({'error': 'Thương hiệu không tồn tại'}), 404
            
        return jsonify({'message': 'Xóa thương hiệu thành công'}), 200
        
    except ValueError as e:
        # Lỗi khi có sản phẩm đang sử dụng
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@thuonghieu_api.route('/<int:thuong_hieu_id>/kiem-tra-su-dung', methods=['GET'])
def kiem_tra_su_dung_thuong_hieu(thuong_hieu_id: int):
    """Kiểm tra xem thương hiệu có đang được sử dụng bởi sản phẩm nào không"""
    try:
        service = ThuongHieuService(db.session)
        kiem_tra_result = service.kiem_tra_su_dung(thuong_hieu_id)
        
        return jsonify(kiem_tra_result), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500