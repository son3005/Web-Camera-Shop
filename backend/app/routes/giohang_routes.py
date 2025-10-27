# /backend/app/routes/giohang_routes.py

from flask import Blueprint, request, jsonify
from app.extensions import db, spec
from flask_pydantic_spec import Request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity

# Import Decorator
from app.utils.decorators import jwt_required # (Giả sử bạn có decorator này, hoặc dùng @jwt_required() của flask_jwt_extended)

# Import Service và các lỗi nghiệp vụ
from app.services.giohang_service import (
    GioHangService,
    VariantNotFound,
    OutOfStockError,
    CartItemNotFoundError
)

# Import Schemas
from app.schemas.giohang_dathang import GioHangResponse, ChiTietGioHangCreate, ChiTietGioHangUpdate

# Tạo Blueprint
cart_api = Blueprint('cart_api', __name__, url_prefix='/api/cart')


@cart_api.route('/', methods=['GET'])
@jwt_required() # Tất cả nghiệp vụ giỏ hàng đều cần user đăng nhập
@spec.validate(
    resp=Response(HTTP_200=GioHangResponse), 
    tags=['Giỏ Hàng (User)']
)
def get_user_cart():
    """(User) Lấy thông tin giỏ hàng của người dùng hiện tại."""
    user_id = get_jwt_identity()
    
    try:
        # 1. Gọi Service (Service này tự tạo giỏ hàng nếu chưa có)
        cart = GioHangService.get_cart_by_user_id(user_id)
        
        # 2. Commit (Vì service có thể đã TẠO mới giỏ hàng)
        db.session.commit()
        
        # 3. Trả về
        # (Lưu ý: Schema GioHangResponse của bạn có các trường tính toán
        # như 'tong_so_luong', 'tam_tinh'. Bạn cần đảm bảo model GioHang
        # có các @property để Pydantic 'from_orm' tự động gọi)
        return cart, 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500

@cart_api.route('/items', methods=['POST'])
@jwt_required()
@spec.validate(
    body=Request(ChiTietGioHangCreate), 
    resp=Response(HTTP_200=GioHangResponse), 
    tags=['Giỏ Hàng (User)']
)
def add_item_to_cart():
    """(User) Thêm một sản phẩm vào giỏ hàng."""
    user_id = get_jwt_identity()
    data: ChiTietGioHangCreate = request.context.body
    
    try:
        # 1. Gọi Service
        cart = GioHangService.add_item_to_cart(user_id, data)
        
        # 2. Commit
        db.session.commit()
        
        # 3. Trả về
        return cart, 200
        
    except (VariantNotFound, OutOfStockError) as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400 # 400 Bad Request (lỗi dữ liệu/logic)
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500

@cart_api.route('/items/<int:item_id>', methods=['PUT'])
@jwt_required()
@spec.validate(
    body=Request(ChiTietGioHangUpdate), 
    resp=Response(HTTP_200=GioHangResponse), 
    tags=['Giỏ Hàng (User)']
)
def update_cart_item(item_id: int):
    """(User) Cập nhật số lượng của một sản phẩm trong giỏ hàng."""
    user_id = get_jwt_identity()
    data: ChiTietGioHangUpdate = request.context.body

    try:
        # 1. Gọi Service
        cart = GioHangService.update_cart_item(user_id, item_id, data)
        
        # 2. Commit
        db.session.commit()
        
        # 3. Trả về
        return cart, 200
        
    except CartItemNotFoundError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 404 # 404 Not Found
    except (VariantNotFound, OutOfStockError) as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400 # 400 Bad Request
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500

@cart_api.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
@spec.validate(
    resp=Response(HTTP_200=GioHangResponse), 
    tags=['Giỏ Hàng (User)']
)
def remove_cart_item(item_id: int):
    """(User) Xóa một sản phẩm khỏi giỏ hàng."""
    user_id = get_jwt_identity()

    try:
        # 1. Gọi Service
        cart = GioHangService.remove_item_from_cart(user_id, item_id)
        
        # 2. Commit
        db.session.commit()
        
        # 3. Trả về
        return cart, 200
        
    except CartItemNotFoundError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 404 # 404 Not Found
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500