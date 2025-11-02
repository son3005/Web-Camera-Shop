# /backend/app/routes/catalogs_routes.py
import traceback
from flask import jsonify, current_app, request
from flask_openapi3 import APIBlueprint
from werkzeug.exceptions import BadRequest, NotFound

from ..extensions import db
from ..services.khac_service import (
    CatalogsService, DanhMucNotFound, ThuongHieuNotFound
)
# Import Schemas cho cả hai
from ..schemas.sanpham.DanhMuc import (
    DanhMucCreate, DanhMucUpdate, DanhMucResponse, DanhMucListResponse
)
from ..schemas.sanpham.ThuongHieu import (
    ThuongHieuCreate, ThuongHieuUpdate, ThuongHieuResponse, ThuongHieuListResponse
)
from ..schemas.path_models import DanhMucPath, ThuongHieuPath
from ..utils.decorators import admin_required # Giả sử bạn có decorator này

# ==============================================================
# Khởi tạo APIBlueprint
# ==============================================================
# Ta đặt prefix chung là /api/catalogs
catalogs_api = APIBlueprint('catalogs_api', __name__, url_prefix='/api/catalogs')

# ==============================================================
# 1️⃣ DANH MỤC (CATEGORY) ENDPOINTS
# ==============================================================

# 1.1. Lấy danh sách Danh mục
@catalogs_api.get('/danh-muc', responses={"200": DanhMucListResponse})
def get_all_danh_muc():
    """Lấy danh sách danh mục (phân trang)."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        pagination = CatalogsService.get_all_danh_muc(page=page, per_page=per_page)
        
        response_data = {
            "data": [DanhMucResponse.model_validate(item).model_dump() for item in pagination.items],
            "pagination": {
                "page": pagination.page, "per_page": pagination.per_page,
                "total": pagination.total, "pages": pagination.pages
            }
        }
        return jsonify(response_data), 200
    except Exception:
        current_app.logger.error(f"Lỗi lấy danh sách danh mục: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ."}), 500

# 1.2. Lấy chi tiết Danh mục
@catalogs_api.get('/danh-muc/<int:danh_muc_id>', responses={"200": DanhMucResponse})
def get_danh_muc(path: DanhMucPath):
    """Lấy chi tiết một danh mục bằng ID."""
    try:
        danh_muc = CatalogsService.get_danh_muc_by_id(path.danh_muc_id)
        response = DanhMucResponse.model_validate(danh_muc)
        return jsonify(response.model_dump()), 200
    except DanhMucNotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception:
        current_app.logger.error(f"Lỗi lấy danh mục {path.danh_muc_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ."}), 500

# 1.3. Tạo Danh mục (Admin)
@catalogs_api.post('/danh-muc', responses={"201": DanhMucResponse})
@admin_required
def create_danh_muc(body: DanhMucCreate):
    """Tạo danh mục mới."""
    try:
        new_danh_muc = CatalogsService.create_danh_muc(body)
        db.session.commit() # <<< QUẢN LÝ TRANSACTION TẠI ĐÂY
        response = DanhMucResponse.model_validate(new_danh_muc)
        return jsonify(response.model_dump()), 201
    except BadRequest as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi tạo danh mục: {traceback.format_exc()}")
        return jsonify({"error": "Không thể tạo danh mục."}), 500

# 1.4. Cập nhật Danh mục (Admin)
@catalogs_api.put('/danh-muc/<int:danh_muc_id>', responses={"200": DanhMucResponse})
@admin_required
def update_danh_muc(path: DanhMucPath, body: DanhMucUpdate):
    """Cập nhật thông tin danh mục."""
    try:
        updated = CatalogsService.update_danh_muc(path.danh_muc_id, body)
        db.session.commit() # <<< QUẢN LÝ TRANSACTION TẠI ĐÂY
        response = DanhMucResponse.model_validate(updated)
        return jsonify(response.model_dump()), 200
    except (BadRequest, DanhMucNotFound) as e:
        db.session.rollback()
        status = 404 if isinstance(e, DanhMucNotFound) else 400
        return jsonify({"error": str(e)}), status
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi cập nhật danh mục {path.danh_muc_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể cập nhật danh mục."}), 500

# 1.5. Xóa Danh mục (Admin)
@catalogs_api.delete('/danh-muc/<int:danh_muc_id>', responses={"200": None})
@admin_required
def delete_danh_muc(path: DanhMucPath):
    """Xóa một danh mục."""
    try:
        CatalogsService.delete_danh_muc(path.danh_muc_id)
        db.session.commit() # <<< QUẢN LÝ TRANSACTION TẠI ĐÂY
        return jsonify({"message": "Xóa danh mục thành công"}), 200
    except (BadRequest, DanhMucNotFound) as e:
        db.session.rollback()
        status = 404 if isinstance(e, DanhMucNotFound) else 400
        return jsonify({"error": str(e)}), status
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi xóa danh mục {path.danh_muc_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể xóa danh mục."}), 500

# ==============================================================
# 2️⃣ THƯƠNG HIỆU (BRAND) ENDPOINTS
# ==============================================================

# 2.1. Lấy danh sách Thương hiệu
@catalogs_api.get('/thuong-hieu', responses={"200": ThuongHieuListResponse})
def get_all_thuong_hieu():
    """Lấy danh sách thương hiệu (phân trang)."""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        pagination = CatalogsService.get_all_thuong_hieu(page=page, per_page=per_page)
        
        response_data = {
            "data": [ThuongHieuResponse.model_validate(item).model_dump() for item in pagination.items],
            "pagination": {
                "page": pagination.page, "per_page": pagination.per_page,
                "total": pagination.total, "pages": pagination.pages
            }
        }
        return jsonify(response_data), 200
    except Exception:
        current_app.logger.error(f"Lỗi lấy danh sách thương hiệu: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ."}), 500

# 2.2. Lấy chi tiết Thương hiệu
@catalogs_api.get('/thuong-hieu/<int:thuong_hieu_id>', responses={"200": ThuongHieuResponse})
def get_thuong_hieu(path: ThuongHieuPath):
    """Lấy chi tiết một thương hiệu bằng ID."""
    try:
        thuong_hieu = CatalogsService.get_thuong_hieu_by_id(path.thuong_hieu_id)
        response = ThuongHieuResponse.model_validate(thuong_hieu)
        return jsonify(response.model_dump()), 200
    except ThuongHieuNotFound as e:
        return jsonify({"error": str(e)}), 404
    except Exception:
        current_app.logger.error(f"Lỗi lấy thương hiệu {path.thuong_hieu_id}: {traceback.format_exc()}")
        return jsonify({"error": "Lỗi máy chủ."}), 500

# 2.3. Tạo Thương hiệu (Admin)
@catalogs_api.post('/thuong-hieu', responses={"201": ThuongHieuResponse})
@admin_required
def create_thuong_hieu(body: ThuongHieuCreate):
    """Tạo thương hiệu mới."""
    try:
        new_thuong_hieu = CatalogsService.create_thuong_hieu(body)
        db.session.commit() # <<< QUẢN LÝ TRANSACTION TẠI ĐÂY
        response = ThuongHieuResponse.model_validate(new_thuong_hieu)
        return jsonify(response.model_dump()), 201
    except BadRequest as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi tạo thương hiệu: {traceback.format_exc()}")
        return jsonify({"error": "Không thể tạo thương hiệu."}), 500

# 2.4. Cập nhật Thương hiệu (Admin)
@catalogs_api.put('/thuong-hieu/<int:thuong_hieu_id>', responses={"200": ThuongHieuResponse})
@admin_required
def update_thuong_hieu(path: ThuongHieuPath, body: ThuongHieuUpdate):
    """Cập nhật thông tin thương hiệu."""
    try:
        updated = CatalogsService.update_thuong_hieu(path.thuong_hieu_id, body)
        db.session.commit() # <<< QUẢN LÝ TRANSACTION TẠI ĐÂY
        response = ThuongHieuResponse.model_validate(updated)
        return jsonify(response.model_dump()), 200
    except (BadRequest, ThuongHieuNotFound) as e:
        db.session.rollback()
        status = 404 if isinstance(e, ThuongHieuNotFound) else 400
        return jsonify({"error": str(e)}), status
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi cập nhật thương hiệu {path.thuong_hieu_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể cập nhật thương hiệu."}), 500

# 2.5. Xóa Thương hiệu (Admin)
@catalogs_api.delete('/thuong-hieu/<int:thuong_hieu_id>', responses={"200": None})
@admin_required
def delete_thuong_hieu(path: ThuongHieuPath):
    """Xóa một thương hiệu."""
    try:
        CatalogsService.delete_thuong_hieu(path.thuong_hieu_id)
        db.session.commit() # <<< QUẢN LÝ TRANSACTION TẠI ĐÂY
        return jsonify({"message": "Xóa thương hiệu thành công"}), 200
    except (BadRequest, ThuongHieuNotFound) as e:
        db.session.rollback()
        status = 404 if isinstance(e, ThuongHieuNotFound) else 400
        return jsonify({"error": str(e)}), status
    except Exception:
        db.session.rollback()
        current_app.logger.error(f"Lỗi xóa thương hiệu {path.thuong_hieu_id}: {traceback.format_exc()}")
        return jsonify({"error": "Không thể xóa thương hiệu."}), 500