from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_openapi3 import APIBlueprint, Tag
from pydantic import ValidationError
from ..schemas.phieunhap import (
    PhieuNhapCreate, 
    PhieuNhapUpdate, 
    PhieuNhapResponse, 
    ChiTietPhieuNhapResponse,
    PhieuNhapPath
)
from ..services.phieu_nhap_service import PhieuNhapService
from ..extensions import db
from ..utils.decorators import admin_required

# Định nghĩa blueprint và tags
phieu_nhap_api = APIBlueprint('phieu_nhap', __name__, url_prefix='/api/phieu-nhap')
tag_phieu_nhap = Tag(name="Phiếu Nhập", description="Quản lý phiếu nhập hàng")

@phieu_nhap_api.post('/', tags=[tag_phieu_nhap])
# @jwt_required()
@admin_required
def tao_phieu_nhap():
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
                'huong_dan': 'Gửi JSON với các trường: nha_cung_cap_id (int), phieu_nhap_chi_tiets (hoặc phieu_thu_chi_tiets) (list)'
            }), 400
        
        # Kiểm tra nha_cung_cap_id
        nha_cung_cap_id = json_data.get('nha_cung_cap_id')
        if not nha_cung_cap_id:
            return jsonify({
                'error': 'Thiếu nha_cung_cap_id',
                'huong_dan': 'Gửi nha_cung_cap_id là int'
            }), 400
        
        # Xử lý phieu_thu_chi_tiets: Đổi tên thành phieu_nhap_chi_tiets nếu cần
        if 'phieu_thu_chi_tiets' in json_data and 'phieu_nhap_chi_tiets' not in json_data:
            json_data['phieu_nhap_chi_tiets'] = json_data.pop('phieu_thu_chi_tiets')
        
        # Validate dữ liệu với schema
        try:
            phieu_nhap_data = PhieuNhapCreate(**json_data)
        except ValidationError as e:
            return jsonify({
                'error': 'Dữ liệu không hợp lệ',
                'chi_tiet': e.errors()
            }), 400
        
        # Lấy ID người dùng từ JWT token
        # current_user_id = get_jwt_identity()
        current_user_id = 1  # Tạm thời dùng ID 1 để test
        
        # Gọi service tạo phiếu nhập
        phieu_nhap = PhieuNhapService.tao_phieu_nhap(phieu_nhap_data, current_user_id)
        
        # Chuyển đổi sang response schema
        response_data = PhieuNhapService.chuyen_doi_phieu_nhap_sang_response(phieu_nhap)
        
        return jsonify({
            'message': 'Tạo phiếu nhập thành công',
            'data': response_data.model_dump()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Lỗi khi tạo phiếu nhập: {str(e)}'
        }), 400

@phieu_nhap_api.put('/<int:phieu_nhap_id>', tags=[tag_phieu_nhap])
# @jwt_required()
@admin_required
def cap_nhat_phieu_nhap(path: PhieuNhapPath):
    """
    Cập nhật phiếu nhập
    - Điều chỉnh số lượng biến thể dựa trên chênh lệch
    - Xử lý thay đổi biến thể sản phẩm
    """
    try:
        phieu_nhap_id = path.phieu_nhap_id
        
        # Lấy dữ liệu JSON từ request
        json_data = request.get_json(silent=True)
        
        if not json_data:
            return jsonify({
                'error': 'Thiếu dữ liệu JSON'
            }), 400
        
        # Xử lý phieu_thu_chi_tiets: Đổi tên thành phieu_nhap_chi_tiets nếu cần
        if 'phieu_thu_chi_tiets' in json_data and 'phieu_nhap_chi_tiets' not in json_data:
            json_data['phieu_nhap_chi_tiets'] = json_data.pop('phieu_thu_chi_tiets')
        
        # Validate dữ liệu với schema
        try:
            update_data = PhieuNhapUpdate(**json_data)
        except ValidationError as e:
            return jsonify({
                'error': 'Dữ liệu không hợp lệ',
                'chi_tiet': e.errors()
            }), 400
        
        # Gọi service cập nhật
        phieu_nhap = PhieuNhapService.cap_nhat_phieu_nhap(phieu_nhap_id, update_data)
        
        if not phieu_nhap:
            return jsonify({'error': 'Phiếu nhập không tồn tại'}), 404
        
        # Chuyển đổi sang response
        response_data = PhieuNhapService.chuyen_doi_phieu_nhap_sang_response(phieu_nhap)
        
        return jsonify({
            'message': 'Cập nhật phiếu nhập thành công',
            'data': response_data.model_dump()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'error': f'Lỗi khi cập nhật phiếu nhập: {str(e)}'
        }), 400

@phieu_nhap_api.get('/<int:phieu_nhap_id>', tags=[tag_phieu_nhap])
# @jwt_required()
@admin_required
def lay_chi_tiet_phieu_nhap(path: PhieuNhapPath):
    """
    Lấy thông tin chi tiết phiếu nhập với đầy đủ thông tin sản phẩm và biến thể
    """
    phieu_nhap_id = path.phieu_nhap_id
    
    phieu_nhap = PhieuNhapService.lay_phieu_nhap_theo_id(phieu_nhap_id)
    
    if not phieu_nhap:
        return jsonify({'error': 'Phiếu nhập không tồn tại'}), 404
    
    response_data = PhieuNhapService.chuyen_doi_phieu_nhap_sang_response(phieu_nhap)
    
    return jsonify({
        'data': response_data.model_dump()
    }), 200

@phieu_nhap_api.get('', tags=[tag_phieu_nhap])
# @jwt_required()
@admin_required
def lay_danh_sach_phieu_nhap():
    """
    Lấy danh sách phiếu nhập với phân trang và filter
    Query Parameters:
        page: Trang hiện tại (mặc định: 1)
        per_page: Số lượng mỗi trang (mặc định: 10)
        ten_nha_cung_cap: Filter theo tên nhà cung cấp
        ma_phieu_nhap: Filter theo mã phiếu nhập
        ngay_bat_dau: Filter từ ngày (format: YYYY-MM-DD)
        ngay_ket_thuc: Filter đến ngày (format: YYYY-MM-DD)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        ten_nha_cung_cap = request.args.get('ten_nha_cung_cap', None)
        ma_phieu_nhap = request.args.get('ma_phieu_nhap', None)
        ngay_bat_dau = request.args.get('ngay_bat_dau', None)
        ngay_ket_thuc = request.args.get('ngay_ket_thuc', None)
        
        # Gọi service lấy danh sách với filter
        pagination = PhieuNhapService.lay_danh_sach_phieu_nhap(
            page=page,
            per_page=per_page,
            ten_nha_cung_cap=ten_nha_cung_cap,
            ma_phieu_nhap=ma_phieu_nhap,
            ngay_bat_dau=ngay_bat_dau,
            ngay_ket_thuc=ngay_ket_thuc
        )
        
        # Chuyển đổi dữ liệu với đầy đủ thông tin sản phẩm
        phieu_nhap_list = [
            PhieuNhapService.chuyen_doi_phieu_nhap_sang_response(pn).model_dump() 
            for pn in pagination.items
        ]
        
        return jsonify({
            'data': phieu_nhap_list,
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
        return jsonify({'error': f'Lỗi khi lấy danh sách phiếu nhập: {str(e)}'}), 400

@phieu_nhap_api.get('/thong-ke', tags=[tag_phieu_nhap])
# @jwt_required()
@admin_required
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
        thong_ke = PhieuNhapService.thong_ke_nhap_hang_theo_thang(nam, thang)
        
        return jsonify({
            'thong_ke': thong_ke
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': f'Lỗi khi thống kê: {str(e)}'
        }), 400

# Thêm error handler cho validation errors
@phieu_nhap_api.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({
        'error': 'Dữ liệu không hợp lệ',
        'chi_tiet': e.errors()
    }), 400