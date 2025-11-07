# /backend/app/routes/don_hang_routes.py
from flask import request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_openapi3 import APIBlueprint, Tag

from ..extensions import db
from ..models import DonHang, ThanhToan
from ..services.redis_session_service import RedisSessionService
from ..services.donhang_service import DonHangService
from ..schemas.giohang_dathang.DonHang import DonHangCreate, DonHangResponse
from ..schemas.giohang_dathang.ThanhToan import ThanhToanResponse

# Tạo blueprint
don_hang_api = APIBlueprint('don_hang', __name__, url_prefix='/api/don-hang')
tag = Tag(name="Đơn hàng", description="Quản lý đơn hàng")

@don_hang_api.post('/checkout/cart')
@jwt_required()
def checkout_from_cart():
    """Tạo checkout session từ giỏ hàng"""
    try:
        current_user_id = get_jwt_identity()
        
        # Lấy cart session từ Redis
        cart_session = RedisSessionService.get_session('cart', f'user_{current_user_id}')
        if not cart_session or not cart_session.get('items'):
            return {'error': 'Giỏ hàng trống'}, 400
        
        # Tạo checkout session
        checkout_id = RedisSessionService.create_checkout_session(
            cart_session['session_id'],
            {
                'user_id': current_user_id,
                'items': cart_session['items'],
                'type': 'cart'
            }
        )
        
        return {
            'checkout_id': checkout_id,
            'message': 'Checkout session created'
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@don_hang_api.post('/checkout/buy-now')
@jwt_required()
def buy_now(body: dict):
    """Tạo checkout session cho mua ngay"""
    try:
        current_user_id = get_jwt_identity()
        
        # Validate request
        bien_the_id = body.get('bien_the_san_pham_id')
        so_luong = body.get('so_luong', 1)
        
        if not bien_the_id:
            return {'error': 'Thiếu thông tin sản phẩm'}, 400
        
        # Tạo cart session tạm cho mua ngay
        cart_session_id = RedisSessionService.create_cart_session(
            current_user_id,
            [{
                'bien_the_san_pham_id': bien_the_id,
                'so_luong': so_luong
            }]
        )
        
        # Tạo checkout session
        checkout_id = RedisSessionService.create_checkout_session(
            cart_session_id,
            {
                'user_id': current_user_id,
                'items': [{
                    'bien_the_san_pham_id': bien_the_id,
                    'so_luong': so_luong
                }],
                'type': 'buy_now'
            }
        )
        
        return {
            'checkout_id': checkout_id,
            'message': 'Buy now session created'
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@don_hang_api.get('/checkout/<string:checkout_id>')
@jwt_required()
def get_checkout_session(checkout_id: str):
    """Lấy thông tin checkout session"""
    try:
        checkout_data = RedisSessionService.get_session('checkout', checkout_id)
        if not checkout_data:
            return {'error': 'Checkout session không tồn tại'}, 404
        
        return checkout_data, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@don_hang_api.put('/checkout/<string:checkout_id>')
@jwt_required()
def update_checkout_session(checkout_id: str, body: dict):
    """Cập nhật thông tin checkout (địa chỉ, vận chuyển, voucher)"""
    try:
        current_user_id = get_jwt_identity()
        
        # Kiểm tra checkout session
        checkout_data = RedisSessionService.get_session('checkout', checkout_id)
        if not checkout_data:
            return {'error': 'Checkout session không tồn tại'}, 404
        
        # Chỉ cho phép user sở hữu session update
        if checkout_data.get('user_id') != current_user_id:
            return {'error': 'Không có quyền truy cập'}, 403
        
        # Cập nhật thông tin
        updates = {}
        if 'dia_chi_id' in body:
            updates['dia_chi_id'] = body['dia_chi_id']
        if 'phuong_thuc_van_chuyen' in body:
            updates['phuong_thuc_van_chuyen'] = body['phuong_thuc_van_chuyen']
        if 'voucher_code' in body:
            updates['voucher_code'] = body['voucher_code']
        if 'ghi_chu' in body:
            updates['ghi_chu'] = body['ghi_chu']
        
        RedisSessionService.update_session('checkout', checkout_id, updates)
        
        return {'message': 'Cập nhật thành công'}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

@don_hang_api.post('/checkout/<string:checkout_id>/place-order')
@jwt_required()
def place_order(checkout_id: str, body: DonHangCreate):
    """Đặt hàng từ checkout session"""
    try:
        current_user_id = get_jwt_identity()
        
        # Lấy checkout session
        checkout_data = RedisSessionService.get_session('checkout', checkout_id)
        if not checkout_data:
            return {'error': 'Checkout session không tồn tại hoặc đã hết hạn'}, 400
        
        # Validate ownership
        if checkout_data.get('user_id') != current_user_id:
            return {'error': 'Không có quyền truy cập'}, 403
        
        # Chuẩn bị data để tạo đơn hàng
        order_data = {
            **checkout_data,
            **body.dict(),
            'user_id': current_user_id
        }
        
        # Tạo đơn hàng với transaction
        don_hang = DonHangService.create_order_from_checkout(order_data, current_user_id)
        
        # Xóa checkout session sau khi tạo đơn thành công
        RedisSessionService.delete_session('checkout', checkout_id)
        
        # Xóa cart session nếu là từ giỏ hàng
        if checkout_data.get('type') == 'cart':
            RedisSessionService.delete_session('cart', checkout_data['cart_session_id'])
        
        # Trả về thông tin đơn hàng và thanh toán
        return {
            'don_hang': DonHangResponse.from_orm(don_hang).dict(),
            'thanh_toan': ThanhToanResponse.from_orm(don_hang.thanh_toan).dict(),
            'payment_url': f"/payment/{don_hang.thanh_toan.id}"  # URL để chuyển hướng thanh toán
        }, 201
        
    except ValueError as e:
        return {'error': str(e), 'code': 'VALIDATION_ERROR'}, 400
    except Exception as e:
        db.session.rollback()
        return {'error': f'Lỗi khi tạo đơn hàng: {str(e)}'}, 500

@don_hang_api.get('/user')
@jwt_required()
def get_user_orders():
    """Lấy danh sách đơn hàng của user"""
    try:
        current_user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        # Query đơn hàng với phân trang
        orders_query = DonHang.query.filter_by(nguoi_dung_id=current_user_id)
        pagination = orders_query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        orders_data = [
            DonHangResponse.from_orm(order).dict() 
            for order in pagination.items
        ]
        
        return {
            'data': orders_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages
            }
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500