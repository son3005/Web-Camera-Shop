# /backend/app/routes/donhang_routes.py
import traceback
from flask import jsonify, current_app, url_for, request
from flask_openapi3 import APIBlueprint
from flask_jwt_extended import jwt_required, get_jwt_identity

from ..extensions import db
from ..utils.decorators import admin_required
from ..services.donhang_service import (
    DonHangService,
    CartIsEmptyError,
    AddressNotFoundError,
    OrderNotFoundError,
    PermissionDeniedError,
    ServiceError
)
from ..services.giohang_service import VariantNotFound, OutOfStockError
from ..schemas.giohang_dathang import DonHangCreate, DonHangUpdate, DonHangResponse
from ..schemas.Shared import PaginatedResponse


order_api = APIBlueprint('order_api', __name__, url_prefix='/api/orders')


# ==============================================================
# 1. TẠO ĐƠN HÀNG
# ==============================================================
@order_api.post('/', responses={201: DonHangResponse})
@jwt_required()
def create_order(body: DonHangCreate):  # ← Giữ param 'body: Model'
    user_id = get_jwt_identity()

    try:
        new_order = DonHangService.create_order_from_cart(user_id, body)
        db.session.commit()

        order_full = DonHangService.get_order_details(new_order.id, user_id=user_id)
        response = DonHangResponse.model_validate(order_full)

        return (
            jsonify(response.model_dump()),
            201,
            {"Location": url_for("order_api.get_my_order_detail", order_id=new_order.id, _external=True)}
        )
    except (CartIsEmptyError, AddressNotFoundError, VariantNotFound, OutOfStockError, ServiceError) as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi tạo đơn hàng: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi tạo đơn hàng."}), 500


# ==============================================================
# 2. LẤY DANH SÁCH ĐƠN HÀNG CỦA USER
# ==============================================================
@order_api.get('/', responses={200: PaginatedResponse[DonHangResponse]})
@jwt_required()
def get_my_orders():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    try:
        pagination = DonHangService.get_orders_for_user(user_id, page, per_page)
        items = [DonHangResponse.model_validate(o) for o in pagination.items]

        response = PaginatedResponse(
            items=items,
            page=pagination.page,
            per_page=pagination.per_page,
            total_items=pagination.total,
            total_pages=pagination.pages
        )
        return jsonify(response.model_dump()), 200
    except Exception:
        current_app.logger.error(f"Lỗi lấy đơn hàng user {user_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi khi lấy lịch sử đơn hàng."}), 500