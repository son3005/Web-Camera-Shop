# /backend/app/routes/giohang_routes.py
import traceback
from flask import jsonify, current_app
from flask_openapi3 import APIBlueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..extensions import db
from ..services.giohang_service import (
    GioHangService,
    VariantNotFound,
    OutOfStockError,
    CartItemNotFoundError
)
from ..schemas.giohang_dathang import (
    GioHangResponse,
    ChiTietGioHangCreate,
    ChiTietGioHangUpdate
)

# ==============================================================
# APIBlueprint - flask-openapi3
# ==============================================================
cart_api = APIBlueprint('cart_api', __name__, url_prefix='/api/cart')


# ==============================================================
# 1. LẤY GIỎ HÀNG
# ==============================================================
@cart_api.get('/', responses={200: GioHangResponse})
@jwt_required()
def get_user_cart():
    """Lấy giỏ hàng của người dùng hiện tại."""
    user_id = get_jwt_identity()

    try:
        cart = GioHangService.get_or_create_cart(user_id)
        response = GioHangResponse.model_validate(cart)
        return jsonify(response.model_dump()), 200
    except Exception as e:
        current_app.logger.error(f"Lỗi lấy giỏ hàng (user {user_id}): {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy giỏ hàng."}), 500


# ==============================================================
# 2. THÊM SẢN PHẨM
# ==============================================================
@cart_api.post('/items', responses={200: GioHangResponse})
@jwt_required()
def add_item_to_cart(body: ChiTietGioHangCreate):  # ← Giữ param 'body: Model'
    """Thêm sản phẩm vào giỏ hàng."""
    user_id = get_jwt_identity()

    try:
        cart = GioHangService.add_item_to_cart(user_id, body)
        db.session.commit()
        response = GioHangResponse.model_validate(cart)
        return jsonify(response.model_dump()), 200
    except (VariantNotFound, OutOfStockError) as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi thêm vào giỏ: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi thêm sản phẩm."}), 500


# ==============================================================
# 3. CẬP NHẬT SỐ LƯỢNG
# ==============================================================
@cart_api.put('/items/<int:item_id>', responses={200: GioHangResponse})
@jwt_required()
def update_cart_item(item_id: int, body: ChiTietGioHangUpdate):  # ← Giữ param 'body: Model'
    """Cập nhật số lượng sản phẩm trong giỏ."""
    user_id = get_jwt_identity()

    try:
        cart = GioHangService.update_cart_item(user_id, item_id, body)
        db.session.commit()
        response = GioHangResponse.model_validate(cart)
        return jsonify(response.model_dump()), 200
    except CartItemNotFoundError:
        return jsonify({"error": "Mục trong giỏ hàng không tồn tại."}), 404
    except (VariantNotFound, OutOfStockError) as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi cập nhật giỏ hàng: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi cập nhật."}), 500


# ==============================================================
# 4. XÓA MỤC KHỎI GIỎ
# ==============================================================
@cart_api.delete('/items/<int:item_id>', responses={200: GioHangResponse})
@jwt_required()
def remove_cart_item(item_id: int):
    """Xóa sản phẩm khỏi giỏ hàng."""
    user_id = get_jwt_identity()

    try:
        cart = GioHangService.remove_item_from_cart(user_id, item_id)
        db.session.commit()
        response = GioHangResponse.model_validate(cart)
        return jsonify(response.model_dump()), 200
    except CartItemNotFoundError:
        return jsonify({"error": "Mục trong giỏ hàng không tồn tại."}), 404
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi xóa khỏi giỏ: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi xóa sản phẩm."}), 500