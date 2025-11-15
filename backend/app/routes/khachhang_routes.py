from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, current_user
from pydantic import ValidationError
from typing import Optional

from ..services.khachhang_service import KhachHangService
from ..models.enums import VaiTroNguoiDungEnum, TrangThaiNguoiDungEnum
from ..schemas.nguoidung.NguoiDung import NguoiDungResponse
from ..utils.decorators  import admin_required
from pydantic import BaseModel

class KhachHangPath(BaseModel):
    khach_hang_id: int

# Tạo blueprint cho khách hàng
khach_hang_api = Blueprint('khach_hang', __name__, url_prefix='/api/khach-hang')

@khach_hang_api.route('/', methods=['GET'])
@admin_required
def lay_danh_sach_khach_hang():
    """
    Lấy danh sách khách hàng với phân trang và lọc
    """
    try:
        # Lấy tham số từ query string
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        ho_ten = request.args.get('ho_ten')
        email = request.args.get('email')
        so_dien_thoai = request.args.get('so_dien_thoai')
        trang_thai = request.args.get('trang_thai')
        
        # Chuyển đổi trạng thái nếu có
        trang_thai_enum = None
        if trang_thai:
            try:
                trang_thai_enum = TrangThaiNguoiDungEnum(trang_thai)
            except ValueError:
                return jsonify({
                    'success': False,
                    'message': 'Trạng thái không hợp lệ'
                }), 400

        # Gọi service
        result = KhachHangService.lay_danh_sach_khach_hang(
            page=page,
            per_page=per_page,
            ho_ten=ho_ten,
            email=email,
            so_dien_thoai=so_dien_thoai,
            trang_thai=trang_thai_enum
        )
        
        return jsonify({
            'success': True,
            'data': result['data'],
            'pagination': result['pagination']
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lấy danh sách khách hàng: {str(e)}'
        }), 500

@khach_hang_api.route('/<int:khach_hang_id>/trang-thai', methods=['PATCH'])
@admin_required
def cap_nhat_trang_thai_khach_hang(khach_hang_id: KhachHangPath):
    """
    Cập nhật trạng thái khách hàng (khoá/kích hoạt)
    """
    try:

        data = request.get_json()
        if not data or 'trang_thai' not in data:
            return jsonify({
                'success': False,
                'message': 'Thiếu thông tin trạng thái'
            }), 400

        # Validate trạng thái
        try:
            trang_thai_moi = TrangThaiNguoiDungEnum(data['trang_thai'])
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Trạng thái không hợp lệ'
            }), 400

        # Cập nhật trạng thái
        khach_hang = KhachHangService.cap_nhat_trang_thai_khach_hang(
            khach_hang_id, 
            trang_thai_moi
        )
        
        return jsonify({
            'success': True,
            'message': f'Cập nhật trạng thái khách hàng thành công',
            'data': NguoiDungResponse.from_orm(khach_hang).dict()
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi cập nhật trạng thái: {str(e)}'
        }), 500

@khach_hang_api.route('/<int:khach_hang_id>', methods=['GET'])
@admin_required
def lay_chi_tiet_khach_hang(khach_hang_id:KhachHangPath):
    """
    Lấy chi tiết thông tin khách hàng
    """
    try:
        chi_tiet = KhachHangService.lay_chi_tiet_khach_hang(khach_hang_id)
        
        return jsonify({
            'success': True,
            'data': chi_tiet
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi lấy chi tiết khách hàng: {str(e)}'
        }), 500

@khach_hang_api.route('/<int:khach_hang_id>/khoa', methods=['POST'])
@admin_required
def khoa_khach_hang(khach_hang_id: KhachHangPath):
    """
    Khoá tài khoản khách hàng
    """
    try:
        khach_hang = KhachHangService.cap_nhat_trang_thai_khach_hang(
            khach_hang_id, 
            TrangThaiNguoiDungEnum.KHOA
        )
        
        return jsonify({
            'success': True,
            'message': 'Đã khoá tài khoản khách hàng thành công',
            'data': NguoiDungResponse.from_orm(khach_hang).dict()
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi khoá khách hàng: {str(e)}'
        }), 500

@khach_hang_api.route('/<int:khach_hang_id>/kich-hoat', methods=['POST'])
@admin_required
def kich_hoat_khach_hang(khach_hang_id: KhachHangPath):
    """
    Kích hoạt lại tài khoản khách hàng
    """
    try:
        khach_hang = KhachHangService.cap_nhat_trang_thai_khach_hang(
            khach_hang_id, 
            TrangThaiNguoiDungEnum.KICH_HOAT
        )
        
        return jsonify({
            'success': True,
            'message': 'Đã kích hoạt tài khoản khách hàng thành công',
            'data': NguoiDungResponse.from_orm(khach_hang).dict()
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Lỗi khi kích hoạt khách hàng: {str(e)}'
        }), 500