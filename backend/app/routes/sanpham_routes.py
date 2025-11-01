import traceback
from flask import jsonify, current_app, url_for, request
from pydantic import BaseModel, Field
from flask_openapi3 import APIBlueprint
from werkzeug.exceptions import BadRequest, NotFound
from ..extensions import db
from ..services.sanpham_service import SanPhamService
from ..models.sanpham import SanPham, BienTheSanPham
from ..schemas.sanpham import (
    SanPhamCreate, SanPhamUpdate, SanPhamResponse,
    BienTheSanPhamCreate, BienTheSanPhamResponse, BienTheSanPhamUpdate, SanPhamListResponse
)
from ..schemas.path_models import SanPhamPath, BienThePath
from ..utils.decorators import admin_required

# ==============================================================
# Khởi tạo APIBlueprint (flask-openapi3)
# ==============================================================
product_api = APIBlueprint('product_api', __name__, url_prefix='/api/san-pham')



# ==============================================================
# 1️⃣ LẤY DANH SÁCH SẢN PHẨM
# ==============================================================
@product_api.get('', responses={"200": SanPhamListResponse})
def get_all_san_pham():
    """Lấy danh sách sản phẩm (phân trang, lọc, sắp xếp)."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', None, type=str)
        min_price = request.args.get('min_price', None, type=float)
        max_price = request.args.get('max_price', None, type=float)
        sort_by = request.args.get('sort_by', None, type=str)
        thuong_hieu_ids = request.args.getlist('thuong_hieu_ids', type=int)
        danh_muc_ids = request.args.getlist('danh_muc_ids', type=int)

        valid_sorts = ['price_asc', 'price_desc', 'name_asc', 'name_desc']
        if sort_by and sort_by not in valid_sorts:
            return jsonify({"error": "sort_by phải là: price_asc, price_desc, name_asc, name_desc"}), 400

        result = SanPhamService.get_all_san_pham(
            page=page, per_page=per_page, search=search,
            min_price=min_price, max_price=max_price, sort_by=sort_by,
            thuong_hieu_ids=thuong_hieu_ids, danh_muc_ids=danh_muc_ids
        )
        response = SanPhamListResponse.model_validate(result)
        return jsonify(response.model_dump()), 200
    except Exception:
        current_app.logger.error(f"Lỗi lấy danh sách sản phẩm: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy danh sách sản phẩm."}), 500


# ==============================================================
# 2️⃣ LẤY CHI TIẾT SẢN PHẨM
# ==============================================================
@product_api.get(
    '/<int:san_pham_id>',
    responses={"200": SanPhamResponse}
)
def get_san_pham(path: SanPhamPath):  # ← TÊN THAM SỐ LÀ `path`
    try:
        san_pham = SanPhamService.get_san_pham_by_id(path.san_pham_id)
        response = SanPhamResponse.model_validate(san_pham)
        return jsonify(response.model_dump()), 200
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"Lỗi lấy sản phẩm {path.san_pham_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ khi lấy sản phẩm."}), 500


# ==============================================================
# 3️⃣ TẠO SẢN PHẨM (ADMIN)
# ==============================================================
@product_api.post('', responses={"201": SanPhamResponse})
@admin_required
def create_san_pham(body: SanPhamCreate):  # ← Giữ param 'body: Model'
    """Tạo sản phẩm mới."""
    try:
        new_san_pham = SanPhamService.create_san_pham(body)
        db.session.commit()
        response = SanPhamResponse.model_validate(new_san_pham)
        return jsonify(response.model_dump()), 201
    except (BadRequest, NotFound) as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi tạo sản phẩm: {traceback.format_exc()}")
        return jsonify({"error": "Không thể tạo sản phẩm."}), 500


# ==============================================================
# 4️⃣ CẬP NHẬT SẢN PHẨM (ADMIN)
# ==============================================================
@product_api.put(
    '/<int:san_pham_id>',
    responses={"200": SanPhamResponse}
)
@admin_required
def update_san_pham(path: SanPhamPath, body: SanPhamUpdate):
    try:
        updated = SanPhamService.update_san_pham(path.san_pham_id, body)
        db.session.commit()
        response = SanPhamResponse.model_validate(updated)
        return jsonify(response.model_dump()), 200
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi cập nhật sản phẩm {path.san_pham_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể cập nhật sản phẩm."}), 500


# ==============================================================
# 5️⃣ XÓA SẢN PHẨM (ADMIN)
# ==============================================================
@product_api.delete(
    '/<int:san_pham_id>',
    responses={"200": None}
)
@admin_required
def delete_san_pham(path: SanPhamPath):
    try:
        SanPhamService.delete_san_pham(path.san_pham_id)
        db.session.commit()
        return jsonify({"message": "Xóa sản phẩm thành công"}), 200
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi xóa sản phẩm {path.san_pham_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể xóa sản phẩm."}), 500


# ==============================================================
# 6️⃣ TẠO BIẾN THỂ (ADMIN)
# ==============================================================
@product_api.post(
    '/<int:san_pham_id>/bien-the',
    responses={"201": BienTheSanPhamResponse}
)
@admin_required
def create_bien_the(path: SanPhamPath, body: BienTheSanPhamCreate):
    try:
        new_bien_the = SanPhamService.create_bien_the(path.san_pham_id, body)
        db.session.commit()
        response = BienTheSanPhamResponse.model_validate(new_bien_the)
        return jsonify(response.model_dump()), 201
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi tạo biến thể cho sản phẩm {path.san_pham_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể tạo biến thể sản phẩm."}), 500


# ==============================================================
# 7️⃣ CẬP NHẬT BIẾN THỂ (ADMIN)
# ==============================================================
@product_api.put(
    '/<int:san_pham_id>/bien-the/<int:bien_the_id>',
    responses={"200": BienTheSanPhamResponse}
)
@admin_required
def update_bien_the(path: BienThePath, body: BienTheSanPhamUpdate):
    try:
        updated = SanPhamService.update_bien_the(
            path.san_pham_id, 
            path.bien_the_id, 
            body
        )
        db.session.commit()
        return jsonify(BienTheSanPhamResponse.model_validate(updated).model_dump()), 200
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi cập nhật biến thể {path.bien_the_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể cập nhật biến thể."}), 500


# ==============================================================
# 8️⃣ XÓA BIẾN THỂ (ADMIN)
# ==============================================================
@product_api.delete(
    '/<int:san_pham_id>/bien-the/<int:bien_the_id>',
    responses={"200": None}
)
@admin_required
def delete_bien_the(path: BienThePath):
    try:
        SanPhamService.delete_bien_the(path.san_pham_id, path.bien_the_id)
        db.session.commit()
        return jsonify({"message": "Xóa biến thể thành công"}), 200
    except NotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi xóa biến thể {path.bien_the_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể xóa biến thể."}), 500