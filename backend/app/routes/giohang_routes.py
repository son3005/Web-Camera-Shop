from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.orm import Session
from ..extensions import db
from ..services.giohang_service import GioHangService
from ..schemas.giohang_dathang import ChiTietGioHangCreate, ChiTietGioHangUpdate

giohang_api = Blueprint('giohang', __name__, url_prefix='/api/gio-hang')

def get_db_session():
    """Lấy database session - sửa lỗi từ next(db())"""
    return db.session

@giohang_api.route('/', methods=['GET'])
@jwt_required()
def get_gio_hang():
    """Lấy thông tin giỏ hàng của người dùng hiện tại"""
    try:
        current_user_id = get_jwt_identity()
        session = get_db_session()
        
        service = GioHangService(session)
        gio_hang = service.get_gio_hang_public(current_user_id)
        
        return jsonify({
            "success": True,
            "data": gio_hang.model_dump()
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400


@giohang_api.route('/them', methods=['POST'])
@jwt_required()
def them_san_pham_vao_gio_hang():
    """Thêm sản phẩm vào giỏ hàng"""
    try:
        current_user_id = get_jwt_identity()
        session = get_db_session()
        
        data = request.get_json()
        
        # Kiểm tra dữ liệu JSON
        if not data:
            return jsonify({
                "success": False,
                "message": "Thiếu dữ liệu JSON"
            }), 400
            
        bien_the_san_pham_id = data.get('bien_the_san_pham_id')
        so_luong = data.get('so_luong', 1)
        
        if not bien_the_san_pham_id:
            return jsonify({
                "success": False,
                "message": "Thiếu thông tin biến thể sản phẩm"
            }), 400
        
        service = GioHangService(session)
        service.them_san_pham_vao_gio_hang(current_user_id, bien_the_san_pham_id, so_luong)
        
        # Trả về giỏ hàng cập nhật
        gio_hang = service.get_gio_hang_public(current_user_id)
        
        return jsonify({
            "success": True,
            "message": "Đã thêm sản phẩm vào giỏ hàng",
            "data": gio_hang.model_dump()
        }), 200
        
    except ValueError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        session.rollback()  # Thêm rollback khi có lỗi
        return jsonify({
            "success": False,
            "message": f"Có lỗi xảy ra khi thêm vào giỏ hàng: {str(e)}"
        }), 500


@giohang_api.route('/cap-nhat-so-luong', methods=['PUT'])
@jwt_required()
def cap_nhat_so_luong():
    """Cập nhật số lượng sản phẩm trong giỏ hàng"""
    try:
        current_user_id = get_jwt_identity()
        session = get_db_session()
        
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Thiếu dữ liệu JSON"
            }), 400
            
        chi_tiet_gio_hang_id = data.get('chi_tiet_gio_hang_id')
        so_luong = data.get('so_luong')
        
        if not chi_tiet_gio_hang_id or so_luong is None:
            return jsonify({
                "success": False,
                "message": "Thiếu thông tin chi tiết giỏ hàng hoặc số lượng"
            }), 400
        
        # Kiểm tra số lượng là số nguyên
        try:
            so_luong = int(so_luong)
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "message": "Số lượng phải là số nguyên"
            }), 400
        
        service = GioHangService(session)
        service.cap_nhat_so_luong(chi_tiet_gio_hang_id, so_luong, current_user_id)
        
        # Trả về giỏ hàng cập nhật
        gio_hang = service.get_gio_hang_public(current_user_id)
        
        return jsonify({
            "success": True,
            "message": "Đã cập nhật số lượng",
            "data": gio_hang.model_dump()
        }), 200
        
    except ValueError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        session.rollback()
        return jsonify({
            "success": False,
            "message": f"Có lỗi xảy ra khi cập nhật số lượng: {str(e)}"
        }), 500


@giohang_api.route('/xoa/<int:chi_tiet_gio_hang_id>', methods=['DELETE'])
@jwt_required()
def xoa_san_pham_khoi_gio_hang(chi_tiet_gio_hang_id: int):
    """Xóa sản phẩm khỏi giỏ hàng - CHỈ cho phép xóa của chính mình"""
    try:
        current_user_id = get_jwt_identity()
        session = get_db_session()
        
        service = GioHangService(session)
        # THÊM current_user_id làm tham số thứ 2
        service.xoa_san_pham_khoi_gio_hang(chi_tiet_gio_hang_id, current_user_id)
        
        # Trả về giỏ hàng cập nhật
        gio_hang = service.get_gio_hang_public(current_user_id)
        
        return jsonify({
            "success": True,
            "message": "Đã xóa sản phẩm khỏi giỏ hàng",
            "data": gio_hang.model_dump()
        }), 200
        
    except ValueError as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 400
    except Exception as e:
        session.rollback()
        return jsonify({
            "success": False,
            "message": f"Có lỗi xảy ra khi xóa sản phẩm: {str(e)}"
        }), 500


@giohang_api.route('/kiem-tra-ton-kho', methods=['POST'])
@jwt_required()
def kiem_tra_ton_kho():
    """Kiểm tra số lượng tồn kho trước khi thêm vào giỏ hàng"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "message": "Thiếu dữ liệu JSON"
            }), 400
            
        bien_the_san_pham_id = data.get('bien_the_san_pham_id')
        so_luong = data.get('so_luong', 1)
        
        if not bien_the_san_pham_id:
            return jsonify({
                "success": False,
                "message": "Thiếu thông tin biến thể sản phẩm"
            }), 400
        
        session = get_db_session()
        service = GioHangService(session)
        
        du_so_luong = service.kiem_tra_so_luong_ton_kho(bien_the_san_pham_id, so_luong)
        
        return jsonify({
            "success": True,
            "data": {
                "du_so_luong": du_so_luong,
                "bien_the_san_pham_id": bien_the_san_pham_id,
                "so_luong_yeu_cau": so_luong
            }
        }), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Có lỗi xảy ra khi kiểm tra tồn kho: {str(e)}"
        }), 400