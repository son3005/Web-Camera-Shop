# /backend/app/routes/donhang_routes.py

from flask import Blueprint, request, jsonify
from app.extensions import db, spec
from flask_pydantic_spec import Request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity

# Import Decorators
from app.utils.decorators import admin_required, jwt_required # (Giả sử)

# Import Service và các lỗi nghiệp vụ
from app.services.donhang_service import (
    DonHangService,
    CartIsEmptyError,
    AddressNotFoundError,
    OrderNotFoundError,
    PermissionDeniedError,
    ServiceError
)
# Import các lỗi dùng chung
from app.services.giohang_service import VariantNotFound, OutOfStockError

# Import Schemas
# (Sửa lại đường dẫn import schema DonHang cho đúng)
from app.schemas.giohang_dathang import DonHangCreate, DonHangUpdate, DonHangResponse
from app.schemas.Shared import PaginatedResponse
# (Sửa lại đường dẫn import enum cho đúng)
from app.models.enums import TrangThaiDonHangEnum

# Tạo Blueprint
order_api = Blueprint('order_api', __name__, url_prefix='/api/orders')


# --- ROUTE CHO USER (Đặt hàng, Xem lịch sử) ---

@order_api.route('/', methods=['POST'])
@jwt_required()
@spec.validate(
    body=Request(DonHangCreate),
    resp=Response(HTTP_201=DonHangResponse),
    tags=['Đơn Hàng (User)']
)
def create_order():
    """(User) Tạo một đơn hàng mới từ giỏ hàng (Checkout)."""
    user_id = get_jwt_identity()
    data: DonHangCreate = request.context.body

    try:
        new_order = DonHangService.create_order_from_cart(user_id, data)
        db.session.commit()
        return new_order, 201
    except (CartIsEmptyError, AddressNotFoundError, VariantNotFound, OutOfStockError) as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400
    except Exception as e:
        db.session.rollback()
        # Log lỗi chi tiết ở đây
        print(f"Lỗi khi tạo đơn hàng: {str(e)}")
        return jsonify(error="Đã xảy ra lỗi không mong muốn khi tạo đơn hàng."), 500

@order_api.route('/', methods=['GET'])
@jwt_required()
@spec.validate(
    resp=Response(HTTP_200=PaginatedResponse[DonHangResponse]),
    tags=['Đơn Hàng (User)']
)
def get_my_orders():
    """(User) Lấy lịch sử đơn hàng của người dùng (có phân trang)."""
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    try:
        pagination = DonHangService.get_orders_for_user(user_id, page, per_page)
        items_response = [DonHangResponse.from_orm(o) for o in pagination.items]
        pag_response = PaginatedResponse(
            items=items_response,
            page=pagination.page,
            per_page=pagination.per_page,
            total_items=pagination.total,
            total_pages=pagination.pages
        )
        return jsonify(pag_response.dict()), 200
    except Exception as e:
        print(f"Lỗi khi lấy lịch sử đơn hàng: {str(e)}")
        return jsonify(error="Lỗi khi lấy lịch sử đơn hàng."), 500

@order_api.route('/<int:order_id>', methods=['GET'])
@jwt_required()
@spec.validate(
    resp=Response(HTTP_200=DonHangResponse),
    tags=['Đơn Hàng (User)']
)
def get_my_order_detail(order_id: int):
    """(User) Lấy chi tiết một đơn hàng CỦA MÌNH."""
    user_id = get_jwt_identity()

    try:
        order = DonHangService.get_order_details(order_id, user_id=user_id, is_admin=False)
        return order, 200
    except OrderNotFoundError as e:
        return jsonify(error=str(e)), 404
    except PermissionDeniedError as e:
        return jsonify(error=str(e)), 403
    except Exception as e:
        print(f"Lỗi khi lấy chi tiết đơn hàng (user): {str(e)}")
        return jsonify(error="Lỗi khi lấy chi tiết đơn hàng."), 500


# --- ROUTE CHO ADMIN (Quản lý đơn hàng) ---

# --- (ĐÂY LÀ ROUTE ĐƯỢC CẬP NHẬT) ---
@order_api.route('/admin', methods=['GET'])
@admin_required()
@spec.validate(
    resp=Response(HTTP_200=PaginatedResponse[DonHangResponse]),
    tags=['Admin - Đơn Hàng']
)
def get_all_orders():
    """(Admin) Lấy TẤT CẢ đơn hàng (có phân trang, bộ lọc nâng cao, sắp xếp)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    # 1. Lấy các tham số lọc
    filters = {}
    if request.args.get('trang_thai'):
        # Nhận chuỗi trạng thái, ví dụ: "CHO_XAC_NHAN,DA_XAC_NHAN"
        filters['trang_thai'] = request.args.get('trang_thai', type=str)
    if request.args.get('search_term'):
        filters['search_term'] = request.args.get('search_term', type=str)
    if request.args.get('start_date'):
        filters['start_date'] = request.args.get('start_date', type=str) # YYYY-MM-DD
    if request.args.get('end_date'):
        filters['end_date'] = request.args.get('end_date', type=str) # YYYY-MM-DD

    # 2. Lấy các tham số sắp xếp
    sort_by = request.args.get('sort_by', 'date', type=str) # Mặc định sort theo 'date'
    sort_order = request.args.get('sort_order', 'desc', type=str) # Mặc định 'desc'

    try:
        # 3. Gọi Service với đầy đủ tham số
        pagination = DonHangService.get_all_orders_admin(
            page=page,
            per_page=per_page,
            filters=filters,
            sort_by=sort_by,
            sort_order=sort_order
        )

        # 4. Tạo response
        items_response = [DonHangResponse.from_orm(o) for o in pagination.items]
        pag_response = PaginatedResponse(
            items=items_response,
            page=pagination.page,
            per_page=pagination.per_page,
            total_items=pagination.total,
            total_pages=pagination.pages
        )
        return jsonify(pag_response.dict()), 200

    except Exception as e:
        print(f"Lỗi khi lấy danh sách đơn hàng (admin): {str(e)}")
        return jsonify(error="Lỗi khi lấy danh sách đơn hàng."), 500

@order_api.route('/<int:order_id>/status', methods=['PATCH'])
@admin_required()
@spec.validate(
    body=Request(DonHangUpdate),
    resp=Response(HTTP_200=DonHangResponse),
    tags=['Admin - Đơn Hàng']
)
def update_order_status(order_id: int):
    """(Admin) Cập nhật trạng thái một đơn hàng (VD: Xác nhận, Hủy...)."""
    data: DonHangUpdate = request.context.body

    try:
        order = DonHangService.update_order_status(order_id, data)
        db.session.commit()
        # Query lại để load đầy đủ thông tin (nếu cần)
        updated_order_full = DonHangService.get_order_details(order_id, is_admin=True)
        return updated_order_full, 200

    except OrderNotFoundError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 404
    except ServiceError as e: # Bắt lỗi trạng thái không hợp lệ từ Service
         db.session.rollback()
         return jsonify(error=str(e)), 400
    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi cập nhật trạng thái đơn hàng: {str(e)}")
        return jsonify(error="Lỗi khi cập nhật trạng thái đơn hàng."), 500

# --- (THÊM ROUTE NÀY CHO ADMIN XEM CHI TIẾT) ---
@order_api.route('/admin/<int:order_id>', methods=['GET'])
@admin_required()
@spec.validate(
    resp=Response(HTTP_200=DonHangResponse),
    tags=['Admin - Đơn Hàng']
)
def get_order_detail_admin(order_id: int):
    """(Admin) Lấy chi tiết một đơn hàng BẤT KỲ."""
    try:
        order = DonHangService.get_order_details(order_id, is_admin=True)
        return order, 200
    except OrderNotFoundError as e:
        return jsonify(error=str(e)), 404
    except Exception as e:
        print(f"Lỗi khi lấy chi tiết đơn hàng (admin): {str(e)}")
        return jsonify(error="Lỗi khi lấy chi tiết đơn hàng."), 500