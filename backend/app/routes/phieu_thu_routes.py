from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_openapi3 import APIBlueprint, Tag
from pydantic import ValidationError
from ..schemas.phieuthu import (
    PhieuThuCreate, 
    PhieuThuUpdate, 
    PhieuThuResponse, 
    ChiTietPhieuThuResponse,
    PhieuThuPath
)
from ..services.phieu_thu_service import PhieuThuService
from ..extensions import db

# Định nghĩa blueprint và tags
phieu_thu_api = APIBlueprint('phieu_thu', __name__, url_prefix='/api/phieu-thu')
tag_phieu_thu = Tag(name="Phiếu Thu", description="Quản lý phiếu thu nhập hàng")

@phieu_thu_api.post('/', tags=[tag_phieu_thu])
# @jwt_required()
def tao_phieu_thu():
    """
    Tạo phiếu thu mới
    - Tự động generate mã phiếu thu
    - Cộng dồn số lượng biến thể sản phẩm
    """
    try:
        # Lấy dữ liệu JSON từ request
        json_data = request.get_json(silent=True)
        
        # Kiểm tra nếu không có dữ liệu
        if not json_data:
            return jsonify({
                'error': 'Thiếu dữ liệu JSON',
                'huong_dan': 'Gửi JSON với các trường: ten_nha_cung_cap, phieu_thu_chi_tiets'
            }), 400
        
        # Validate dữ liệu với schema
        try:
            phieu_thu_data = PhieuThuCreate(**json_data)
        except ValidationError as e:
            return jsonify({
                'error': 'Dữ liệu không hợp lệ',
                'chi_tiet': e.errors()
            }), 400
        
        # Lấy ID người dùng từ JWT token
        # current_user_id = get_jwt_identity()
        current_user_id = 1  # Tạm thời dùng ID 1 để test
        
        # Gọi service tạo phiếu thu
        phieu_thu = PhieuThuService.tao_phieu_thu(phieu_thu_data, current_user_id)
        
        # Chuyển đổi sang response schema
        response_data = PhieuThuService.chuyen_doi_phieu_thu_sang_response(phieu_thu)
        
        return jsonify({
            'message': 'Tạo phiếu thu thành công',
            'data': response_data.model_dump()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Lỗi khi tạo phiếu thu: {str(e)}'
        }), 400

@phieu_thu_api.put('/<int:phieu_thu_id>', tags=[tag_phieu_thu])
# @jwt_required()
def cap_nhat_phieu_thu(path: PhieuThuPath):
    """
    Cập nhật phiếu thu
    - Điều chỉnh số lượng biến thể dựa trên chênh lệch
    - Xử lý thay đổi biến thể sản phẩm
    """
    try:
        phieu_thu_id = path.phieu_thu_id
        
        # Lấy dữ liệu JSON từ request
        json_data = request.get_json(silent=True)
        
        if not json_data:
            return jsonify({
                'error': 'Thiếu dữ liệu JSON'
            }), 400
        
        # Validate dữ liệu với schema
        try:
            update_data = PhieuThuUpdate(**json_data)
        except ValidationError as e:
            return jsonify({
                'error': 'Dữ liệu không hợp lệ',
                'chi_tiet': e.errors()
            }), 400
        
        # Gọi service cập nhật
        phieu_thu = PhieuThuService.cap_nhat_phieu_thu(phieu_thu_id, update_data)
        
        if not phieu_thu:
            return jsonify({'error': 'Phiếu thu không tồn tại'}), 404
        
        # Chuyển đổi sang response
        response_data = PhieuThuService.chuyen_doi_phieu_thu_sang_response(phieu_thu)
        
        return jsonify({
            'message': 'Cập nhật phiếu thu thành công',
            'data': response_data.model_dump()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Lỗi khi cập nhật phiếu thu: {str(e)}'
        }), 400

@phieu_thu_api.get('/<int:phieu_thu_id>', tags=[tag_phieu_thu])
# @jwt_required()
def lay_chi_tiet_phieu_thu(path: PhieuThuPath):
    """
    Lấy thông tin chi tiết phiếu thu với đầy đủ thông tin sản phẩm và biến thể
    """
    phieu_thu_id = path.phieu_thu_id
    
    phieu_thu = PhieuThuService.lay_phieu_thu_theo_id(phieu_thu_id)
    
    if not phieu_thu:
        return jsonify({'error': 'Phiếu thu không tồn tại'}), 404
    
    response_data = PhieuThuService.chuyen_doi_phieu_thu_sang_response(phieu_thu)
    
    return jsonify({
        'data': response_data.model_dump()
    }), 200

@phieu_thu_api.get('', tags=[tag_phieu_thu])
# @jwt_required()
def lay_danh_sach_phieu_thu():
    """
    Lấy danh sách phiếu thu với phân trang và filter
    Query Parameters:
        page: Trang hiện tại (mặc định: 1)
        per_page: Số lượng mỗi trang (mặc định: 10)
        ten_nha_cung_cap: Filter theo tên nhà cung cấp
        ma_phieu_thu: Filter theo mã phiếu thu
        ngay_bat_dau: Filter từ ngày (format: YYYY-MM-DD)
        ngay_ket_thuc: Filter đến ngày (format: YYYY-MM-DD)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        ten_nha_cung_cap = request.args.get('ten_nha_cung_cap', None)
        ma_phieu_thu = request.args.get('ma_phieu_thu', None)
        ngay_bat_dau = request.args.get('ngay_bat_dau', None)
        ngay_ket_thuc = request.args.get('ngay_ket_thuc', None)
        
        # Gọi service lấy danh sách với filter
        pagination = PhieuThuService.lay_danh_sach_phieu_thu(
            page=page,
            per_page=per_page,
            ten_nha_cung_cap=ten_nha_cung_cap,
            ma_phieu_thu=ma_phieu_thu,
            ngay_bat_dau=ngay_bat_dau,
            ngay_ket_thuc=ngay_ket_thuc
        )
        
        # Chuyển đổi dữ liệu với đầy đủ thông tin sản phẩm
        phieu_thu_list = [
            PhieuThuService.chuyen_doi_phieu_thu_sang_response(pt).model_dump() 
            for pt in pagination.items
        ]
        
        return jsonify({
            'data': phieu_thu_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Lỗi khi lấy danh sách phiếu thu: {str(e)}'}), 400

@phieu_thu_api.get('/thong-ke', tags=[tag_phieu_thu])
# @jwt_required()
def thong_ke_nhap_hang():
    """
    Thống kê nhập hàng theo tháng/năm
    Query Parameters:
        nam: Năm cần thống kê (bắt buộc)
        thang: Tháng cần thống kê (tùy chọn)
    """
    try:
        nam = request.args.get('nam', type=int)
        thang = request.args.get('thang', type=int)
        
        if not nam:
            return jsonify({'error': 'Tham số năm là bắt buộc'}), 400
        
        if thang and (thang < 1 or thang > 12):
            return jsonify({'error': 'Tháng phải từ 1 đến 12'}), 400
        
        # Gọi service thống kê
        thong_ke = PhieuThuService.thong_ke_nhap_hang_theo_thang(nam, thang)
        
        return jsonify({
            'thong_ke': thong_ke
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Lỗi khi thống kê: {str(e)}'
        }), 400

# Thêm error handler cho validation errors
@phieu_thu_api.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({
        'error': 'Dữ liệu không hợp lệ',
        'chi_tiet': e.errors()
    }), 400