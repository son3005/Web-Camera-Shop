# /backend/app/routes/danh_gia_routes.py
from flask import Blueprint, request, jsonify
from app.extensions import db, spec
from flask_pydantic_spec import Request, Response
from typing import List
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils.decorators import admin_required

# Import Service và các lỗi nghiệp vụ
from app.services.danhgia_service import (
    DanhGiaService,
    ProductNotFound,
    ReviewError,
    PermissionDeniedError,
    AlreadyReviewedError,
    InvalidDataError
)
# (QUAN TRỌNG) Import model DanhGia để query lại
from app.models.extras import DanhGia
from sqlalchemy.orm import joinedload

# Import Schema
from app.schemas.extras import DanhGiaResponse, DanhGiaCreate, DanhGiaUpdate
from app.schemas.Shared import PaginatedResponse 

# --- TẠO 2 BLUEPRINT ---
# 1. API Public: Lấy danh sách đánh giá
public_review_api = Blueprint('public_review_api', __name__)

# 2. API Private: Cần đăng nhập (để tạo) hoặc admin (để duyệt)
private_review_api = Blueprint('private_review_api', __name__, url_prefix='/api')


# --- API 1: LẤY ĐÁNH GIÁ (PUBLIC) ---
@public_review_api.route('/api/products/<int:product_id>/reviews', methods=['GET'])
@spec.validate(
    resp=Response(HTTP_200=PaginatedResponse[DanhGiaResponse]), 
    tags=['Đánh Giá (Public)']
)
def get_product_reviews(product_id: int):
    """(Public) Lấy danh sách đánh giá (đã duyệt, có phân trang) cho một sản phẩm."""
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 5, type=int) # Mặc định 5 đánh giá/trang
    
    try:
        # 1. Gọi service (đã có logic filter 'DA_DUYET' và 'joinedload')
        pagination = DanhGiaService.get_reviews_for_product(product_id, page, per_page)
        
        # 2. Chuyển đổi data sang Pydantic
        items_response = [DanhGiaResponse.from_orm(review) for review in pagination.items]
        
        # 3. Tạo response phân trang (chuẩn theo Shared.py của bạn)
        pag_response = PaginatedResponse(
            items=items_response,
            page=pagination.page,
            per_page=pagination.per_page,
            total_items=pagination.total,
            total_pages=pagination.pages
        )
        
        return pag_response, 200

    except ProductNotFound as e:
        return jsonify(error=str(e)), 404
    except Exception as e:
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500


# --- API 2: TẠO ĐÁNH GIÁ (USER) ---
@private_review_api.route('/reviews', methods=['POST'])
@jwt_required() # Yêu cầu user đăng nhập
@spec.validate(
    body=Request(DanhGiaCreate),
    resp=Response(HTTP_201=DanhGiaResponse),
    tags=['Đánh Giá (User)']
)
def create_new_review():
    """(User) Tạo một đánh giá mới cho một chi tiết đơn hàng đã mua."""
    user_id = get_jwt_identity() # Lấy user_id từ token
    data: DanhGiaCreate = request.context.body
    
    try:
        # 1. Gọi service (service sẽ kiểm tra quyền sở hữu)
        new_review = DanhGiaService.create_review(user_id, data)
        
        # 2. Commit
        db.session.commit()
        
        # 3. (QUAN TRỌNG) Query lại để load 'nguoi_dung'
        #    Vì 'new_review' vừa tạo chưa có 'nguoi_dung' object
        review_with_user = db.session.query(DanhGia).options(
            joinedload(DanhGia.nguoi_dung)
        ).get(new_review.id)

        return review_with_user, 201

    except (PermissionDeniedError, AlreadyReviewedError, InvalidDataError) as e:
        db.session.rollback()
        return jsonify(error=str(e)), 403 # 403 Forbidden hoặc 400 Bad Request
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500


# --- API 3: DUYỆT ĐÁNH GIÁ (ADMIN) ---
@private_review_api.route('/admin/reviews/<int:review_id>', methods=['PATCH'])
@admin_required() # Yêu cầu quyền admin
@spec.validate(
    body=Request(DanhGiaUpdate),
    resp=Response(HTTP_200=DanhGiaResponse),
    tags=['Đánh Giá (Admin)']
)
def update_review_status_route(review_id: int):
    """(Admin) Cập nhật trạng thái (duyệt/từ chối) một đánh giá."""
    data: DanhGiaUpdate = request.context.body

    try:
        # 1. Gọi service
        updated_review = DanhGiaService.update_review_status(review_id, data)
        
        # 2. Commit
        db.session.commit()
        
        # 3. Query lại để load 'nguoi_dung' cho response
        review_with_user = db.session.query(DanhGia).options(
            joinedload(DanhGia.nguoi_dung)
        ).get(updated_review.id)

        return review_with_user, 200
        
    except ReviewError as e:
        db.session.rollback()
        return jsonify(error=str(e)), 404
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500