# /backend/app/routes/donhang_routes.py

from flask import Blueprint, request, jsonify
from ..extensions import db, spec
from flask_pydantic_spec import Request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from pydantic import BaseModel, Field
from typing import Dict

# Import Decorators
from ..utils.decorators import admin_required  # (Giả sử không cần jwt_required riêng vì đã tích hợp trong admin_required)

# Import Service và các lỗi nghiệp vụ
from ..services.donhang_service import (
    DonHangService,
    CartIsEmptyError,
    AddressNotFoundError,
    OrderNotFoundError,
    PermissionDeniedError,
    ServiceError # Thêm ServiceError
)
# Import các lỗi dùng chung
from ..services.giohang_service import VariantNotFound, OutOfStockError
from ..schemas.giohang_dathang import DonHangCreate, DonHangUpdate, DonHangResponse
from ..schemas.Shared import PaginatedResponse
# Import Enum từ file mới
from ..models.enums import TrangThaiDonHangEnum

# Tạo Blueprint
order_api = Blueprint('order_api', __name__, url_prefix='/api/orders')


# --- ROUTE CHO USER (Giữ nguyên) ---
@order_api.route('/', methods=['POST'], endpoint='create_order')
@jwt_required()
@spec.validate( body=Request(DonHangCreate), resp=Response(HTTP_201=DonHangResponse), tags=['Đơn Hàng (User)'])
def create_order():
    # ... (code giữ nguyên) ...
    user_id = get_jwt_identity()
    data: DonHangCreate = request.context.body
    try:
        new_order = DonHangService.create_order_from_cart(user_id, data)
        db.session.commit()
        # Query lại để load đầy đủ thông tin trước khi trả về
        order_full = DonHangService.get_order_details(new_order.id, user_id=user_id)
        return order_full, 201
    except (CartIsEmptyError, AddressNotFoundError, VariantNotFound, OutOfStockError, ServiceError) as e: # Bắt cả ServiceError
        db.session.rollback()
        return jsonify(error=str(e)), 400
    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi tạo đơn hàng: {str(e)}") # Log lỗi
        return jsonify(error="Đã xảy ra lỗi không mong muốn khi tạo đơn hàng."), 500

@order_api.route('/', methods=['GET'], endpoint='get_my_orders')
@jwt_required()
@spec.validate( resp=Response(HTTP_200=PaginatedResponse[DonHangResponse]), tags=['Đơn Hàng (User)'])
def get_my_orders():
    # ... (code giữ nguyên) ...
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    try:
        pagination = DonHangService.get_orders_for_user(user_id, page, per_page)
        items_response = [DonHangResponse.from_orm(o) for o in pagination.items]
        pag_response = PaginatedResponse(
            items=items_response, page=pagination.page, per_page=pagination.per_page,
            total_items=pagination.total, total_pages=pagination.pages
        )
        return jsonify(pag_response.dict()), 200
    except Exception as e:
        print(f"Lỗi khi lấy lịch sử đơn hàng: {str(e)}")
        return jsonify(error="Lỗi khi lấy lịch sử đơn hàng."), 500

@order_api.route('/<int:order_id>', methods=['GET'], endpoint='get_my_order_detail')
@jwt_required()
@spec.validate( resp=Response(HTTP_200=DonHangResponse), tags=['Đơn Hàng (User)'])
def get_my_order_detail(order_id: int):
    # ... (code giữ nguyên) ...
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

@order_api.route('/admin', methods=['GET'], endpoint='get_all_orders')
@admin_required
@spec.validate( resp=Response(HTTP_200=PaginatedResponse[DonHangResponse]), tags=['Admin - Đơn Hàng'])
def get_all_orders():
    # ... (code giữ nguyên) ...
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    filters = {}
    if request.args.get('trang_thai'):
        filters['trang_thai'] = request.args.get('trang_thai', type=str)
    if request.args.get('search_term'):
        filters['search_term'] = request.args.get('search_term', type=str)
    if request.args.get('start_date'):
        filters['start_date'] = request.args.get('start_date', type=str)
    if request.args.get('end_date'):
        filters['end_date'] = request.args.get('end_date', type=str)
    sort_by = request.args.get('sort_by', 'date', type=str)
    sort_order = request.args.get('sort_order', 'desc', type=str)

    try:
        pagination = DonHangService.get_all_orders_admin(
            page=page, per_page=per_page, filters=filters, sort_by=sort_by, sort_order=sort_order
        )
        items_response = [DonHangResponse.from_orm(o) for o in pagination.items]
        pag_response = PaginatedResponse(
            items=items_response, page=pagination.page, per_page=pagination.per_page,
            total_items=pagination.total, total_pages=pagination.pages
        )
        return jsonify(pag_response.dict()), 200
    except Exception as e:
        print(f"Lỗi khi lấy danh sách đơn hàng (admin): {str(e)}")
        return jsonify(error="Lỗi khi lấy danh sách đơn hàng."), 500


# --- (ROUTE MỚI CHO SUMMARY) ---
# Schema đơn giản cho response của summary
class OrderSummaryResponse(BaseModel):
    # Dùng Field để thêm mô tả cho Swagger
    summary: Dict[str, int] = Field(..., description="Dictionary chứa số lượng đơn theo từng trạng thái (key là tên Enum dạng string, ví dụ: 'cho_xac_nhan')")

@order_api.route('/admin/summary', methods=['GET'], endpoint='get_order_summary')
@admin_required
@spec.validate(
    resp=Response(HTTP_200=OrderSummaryResponse), # Dùng schema mới
    tags=['Admin - Đơn Hàng']
)
def get_order_summary():
    """(Admin) Lấy thống kê số lượng đơn hàng theo trạng thái."""
    try:
        summary_data = DonHangService.get_order_summary_by_status()
        # Trả về dưới dạng {'summary': {'cho_xac_nhan': 15, ...}} để khớp schema
        return jsonify(summary=summary_data), 200
    except Exception as e:
        print(f"Lỗi khi lấy thống kê đơn hàng: {str(e)}")
        return jsonify(error="Lỗi khi lấy thống kê đơn hàng."), 500
# --- (HẾT ROUTE MỚI) ---


@order_api.route('/<int:order_id>/status', methods=['PATCH'], endpoint='update_order_status')
@admin_required
@spec.validate( body=Request(DonHangUpdate), resp=Response(HTTP_200=DonHangResponse), tags=['Admin - Đơn Hàng'])
def update_order_status(order_id: int):
    # ... (code giữ nguyên) ...
    data: DonHangUpdate = request.context.body
    try:
        order = DonHangService.update_order_status(order_id, data)
        db.session.commit()
        updated_order_full = DonHangService.get_order_details(order_id, is_admin=True)
        return updated_order_full, 200
    except OrderNotFoundError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 404
    except ServiceError as e:
         db.session.rollback()
         return jsonify(error=str(e)), 400
    except Exception as e:
        db.session.rollback()
        print(f"Lỗi khi cập nhật trạng thái đơn hàng: {str(e)}")
        return jsonify(error="Lỗi khi cập nhật trạng thái đơn hàng."), 500

@order_api.route('/admin/<int:order_id>', methods=['GET'], endpoint='get_order_detail_admin')
@admin_required
@spec.validate( resp=Response(HTTP_200=DonHangResponse), tags=['Admin - Đơn Hàng'])
def get_order_detail_admin(order_id: int):
    # ... (code giữ nguyên) ...
    try:
        order = DonHangService.get_order_details(order_id, is_admin=True)
        return order, 200 # Pydantic-spec tự convert
    except OrderNotFoundError as e:
        return jsonify(error=str(e)), 404
    except Exception as e:
        print(f"Lỗi khi lấy chi tiết đơn hàng (admin): {str(e)}")
        return jsonify(error="Lỗi khi lấy chi tiết đơn hàng."), 500