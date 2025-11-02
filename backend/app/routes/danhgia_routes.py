# /backend/app/routes/danhgia_routes.py
import traceback
from flask import jsonify, current_app, request
from flask_openapi3 import APIBlueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from pydantic import Field
from typing import List

from ..extensions import db
from ..utils.decorators import admin_required
from ..services.danhgia_service import (
    DanhGiaService,
    ProductNotFound,
    ReviewError,
    PermissionDeniedError,
    AlreadyReviewedError,
    InvalidDataError
)
from ..schemas.extras import DanhGiaResponse, DanhGiaCreate, DanhGiaUpdate
from ..schemas.Shared import PaginatedResponse


# ==============================================================
# APIBlueprint
# ==============================================================
review_api = APIBlueprint('review_api', __name__, url_prefix='/api')


# ==============================================================
# 1. LẤY DANH SÁCH ĐÁNH GIÁ
# ==============================================================
@review_api.get(
    '/products/<int:product_id>/reviews',
    responses={200: PaginatedResponse[DanhGiaResponse]}
)
def get_product_reviews(product_id: int):
    """Lấy danh sách đánh giá của một sản phẩm (công khai)."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 5, type=int)

    try:
        pagination = DanhGiaService.get_reviews_for_product(product_id, page, per_page)
        items = [DanhGiaResponse.model_validate(r) for r in pagination.items]

        response = PaginatedResponse(
            items=items,
            page=pagination.page,
            per_page=pagination.per_page,
            total_items=pagination.total,
            total_pages=pagination.pages
        )
        return jsonify(response.model_dump()), 200
    except ProductNotFound:
        return jsonify({"error": "Sản phẩm không tồn tại"}), 404
    except Exception:
        current_app.logger.error(f"Lỗi lấy đánh giá sản phẩm {product_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy đánh giá."}), 500


# ==============================================================
# 2. TẠO ĐÁNH GIÁ
# ==============================================================
@review_api.post(
    '/products/<int:product_id>/reviews',
    responses={201: DanhGiaResponse}
)
@jwt_required()
def create_review(product_id: int, body: DanhGiaCreate):  # ← Giữ param 'body: Model'
    """Người dùng tạo đánh giá cho sản phẩm."""
    user_id = get_jwt_identity()

    try:
        new_review = DanhGiaService.create_review(user_id, product_id, body)
        db.session.commit()
        response = DanhGiaResponse.model_validate(new_review)
        return jsonify(response.model_dump()), 201
    except (ProductNotFound, AlreadyReviewedError, InvalidDataError) as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi tạo đánh giá: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi khi gửi đánh giá."}), 500


# ==============================================================
# 3. CẬP NHẬT ĐÁNH GIÁ
# ==============================================================
@review_api.put(
    '/reviews/<int:review_id>',
    responses={200: DanhGiaResponse}
)
@jwt_required()
def update_review(review_id: int, body: DanhGiaUpdate):  # ← Giữ param 'body: Model'
    """Người dùng cập nhật đánh giá của mình."""
    user_id = get_jwt_identity()

    try:
        updated = DanhGiaService.update_review(user_id, review_id, body)
        db.session.commit()
        response = DanhGiaResponse.model_validate(updated)
        return jsonify(response.model_dump()), 200
    except (ReviewError, PermissionDeniedError) as e:
        return jsonify({"error": str(e)}), 403
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi cập nhật đánh giá {review_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi khi cập nhật đánh giá."}), 500


# ==============================================================
# 4. XÓA ĐÁNH GIÁ
# ==============================================================
@review_api.delete('/reviews/<int:review_id>', responses={200: {"description": "Xóa thành công"}})
@jwt_required()
def delete_review(review_id: int):
    """Người dùng xóa đánh giá của mình."""
    user_id = get_jwt_identity()

    try:
        DanhGiaService.delete_review(user_id, review_id)
        db.session.commit()
        return jsonify({"message": "Xóa đánh giá thành công"}), 200
    except (ReviewError, PermissionDeniedError) as e:
        return jsonify({"error": str(e)}), 403
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi xóa đánh giá {review_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi khi xóa đánh giá."}), 500