# /backend/app/routes/sanpham_routes.py
import traceback
from flask import json, jsonify, current_app, request
from pydantic import BaseModel, Field
from flask_openapi3 import APIBlueprint
from werkzeug.exceptions import BadRequest, NotFound
from ..extensions import db
from ..services.cloudinary_service import delete_image_task
from ..services.sanpham_service import SanPhamService
from ..models.sanpham import SanPham, BienTheSanPham
from ..schemas.sanpham import (
    SanPhamCreate, SanPhamUpdate, SanPhamResponse,
    BienTheSanPhamCreate, BienTheSanPhamResponse, BienTheSanPhamUpdate, SanPhamListResponse,
    HinhAnhCreate, HinhAnhUpdate, HinhAnhResponse
)
from ..services.upload_service import UploadService
from ..schemas.path_models import *  # Giả sử đã có
from ..utils.decorators import admin_required


# ==============================================================
# Khởi tạo APIBlueprint
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
        sort_by_price = request.args.get('sort_by', None, type=str)
        sort_by_name = request.args.get('sort_by', None, type=str)
        thuong_hieu_ids = request.args.getlist('thuong_hieu_ids', type=int)
        danh_muc_ids = request.args.getlist('danh_muc_ids', type=int)
        cap_do_ids = request.args.getlist('cap_do_ids', type=int)

        valid_sorts_price = ['price_asc', 'price_desc', 'name_asc', 'name_desc']
        valid_sorts_name = ['price_asc', 'price_desc', 'name_asc', 'name_desc']
        if sort_by_price and sort_by_price not in valid_sorts_price:
            return jsonify({"error": "sort_by phải là: price_asc, price_desc"}), 400
        if sort_by_name and sort_by_name not in valid_sorts_name:
            return jsonify({"error": "sort_by phải là: name_asc, name_desc"}), 400

        result = SanPhamService.get_all_san_pham(
            page=page, per_page=per_page, search=search,
            min_price=min_price, max_price=max_price, sort_by_price=sort_by_price, sort_by_name=sort_by_name,
            thuong_hieu_ids=thuong_hieu_ids, danh_muc_ids=danh_muc_ids, cap_do_ids=cap_do_ids
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
def get_san_pham(path: SanPhamPath):
    """Lấy chi tiết một sản phẩm theo ID."""
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
# 12️⃣ TẠO SẢN PHẨM VỚI UPLOAD ẢNH (FormData)-ADMIN
# ==============================================================
@product_api.post('/', responses={"201": SanPhamResponse})
def create_san_pham_with_images():
    """Tạo sản phẩm mới với upload ảnh qua FormData."""
    try:
        # Lấy dữ liệu sản phẩm từ form
        product_json = request.form.get('product')
        if not product_json:
            return jsonify({"error": "Thiếu dữ liệu sản phẩm"}), 400
        
        # Parse JSON thành dict
        try:
            product_data = json.loads(product_json)
        except json.JSONDecodeError as e:
            return jsonify({"error": f"Dữ liệu sản phẩm không hợp lệ: {str(e)}"}), 400
        
        # Xử lý upload ảnh và gán URL vào product_data
        for i, bien_the in enumerate(product_data.get('bien_the_san_phams', [])):
            for j, hinh_anh in enumerate(bien_the.get('hinh_anhs', [])):
                # Lấy file ảnh từ form data
                file_key = f'images[{i}][{j}]'
                if file_key in request.files:
                    file = request.files[file_key]
                    if file and file.filename:
                        # Upload ảnh lên Cloudinary
                        try:
                            upload_result = UploadService.upload_direct_to_server(file, folder="san_pham")
                            # Cập nhật URL và public_id vào dữ liệu ảnh
                            hinh_anh['url'] = upload_result['url']
                            hinh_anh['public_id'] = upload_result['public_id']
                        except Exception as e:
                            # Ghi log lỗi upload ảnh
                            current_app.logger.error(f"Lỗi upload ảnh {file_key}: {str(e)}")
                            return jsonify({"error": f"Lỗi upload ảnh {file.filename}: {str(e)}"}), 400
        
        # Chuyển đổi dict thành SanPhamCreate
        try:
            san_pham_create = SanPhamCreate.model_validate(product_data)
        except Exception as e:
            current_app.logger.error(f"Lỗi validate dữ liệu sản phẩm: {str(e)}")
            return jsonify({"error": f"Dữ liệu sản phẩm không hợp lệ: {str(e)}"}), 400
        
        # Gọi service tạo sản phẩm
        new_san_pham = SanPhamService.create_san_pham(san_pham_create)
        db.session.commit()
        
        response = SanPhamResponse.model_validate(new_san_pham)
        return jsonify(response.model_dump()), 201
        
    except (BadRequest, NotFound) as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi BadRequest/NotFound: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi tạo sản phẩm với ảnh: {traceback.format_exc()}")
        return jsonify({"error": f"Không thể tạo sản phẩm: {str(e)}"}), 500
    
# ==============================================================
# 12️⃣ TẠO SẢN PHẨM VỚI UPLOAD ẢNH (FormData) - ADMIN
# ==============================================================
@product_api.put('/<int:san_pham_id>', responses={"200": SanPhamResponse})
def update_san_pham_with_images(path: SanPhamPath):
    """Cập nhật sản phẩm với ảnh (thêm/xóa/sửa ảnh) qua FormData."""
    try:
        current_app.logger.info(f"Bắt đầu update sản phẩm ID: {path.san_pham_id}")
        
        # Lấy dữ liệu sản phẩm từ form
        product_json = request.form.get('product')
        if not product_json:
            return jsonify({"error": "Thiếu dữ liệu sản phẩm"}), 400
        
        current_app.logger.info(f"Dữ liệu product nhận được: {product_json}")
        
        # Parse JSON thành dict
        try:
            product_data = json.loads(product_json)
            current_app.logger.info(f"Parse JSON thành công: {product_data.keys()}")
        except json.JSONDecodeError as e:
            current_app.logger.error(f"Lỗi parse JSON: {str(e)}")
            return jsonify({"error": f"Dữ liệu sản phẩm không hợp lệ: {str(e)}"}), 400
        
        # Xử lý upload ảnh mới
        current_app.logger.info("Bắt đầu xử lý upload ảnh...")
        for i, bien_the in enumerate(product_data.get('cac_bien_the', [])):
            current_app.logger.info(f"Xử lý biến thể {i}: {bien_the.get('ten_bien_the', '')}")
            for j, hinh_anh in enumerate(bien_the.get('hinh_anhs', [])):
                # Nếu là ảnh mới (không có url) thì phải có file
                if not hinh_anh.get('url'):
                    file_key = f'images[{i}][{j}]'
                    current_app.logger.info(f"Kiểm tra file key: {file_key}")
                    if file_key in request.files:
                        file = request.files[file_key]
                        if file and file.filename:
                            current_app.logger.info(f"Upload ảnh mới: {file.filename}")
                            try:
                                upload_result = UploadService.upload_direct_to_server(file, folder="san_pham")
                                hinh_anh['url'] = upload_result['url']
                                hinh_anh['public_id'] = upload_result['public_id']
                                current_app.logger.info(f"Upload thành công: {upload_result['public_id']}")
                            except Exception as e:
                                current_app.logger.error(f"Lỗi upload ảnh {file_key}: {str(e)}")
                                return jsonify({"error": f"Lỗi upload ảnh {file.filename}: {str(e)}"}), 400
        
        # Chuyển đổi dict thành SanPhamUpdate
        current_app.logger.info("Bắt đầu validate dữ liệu với SanPhamUpdate...")
        try:
            san_pham_update = SanPhamUpdate.model_validate(product_data)
            current_app.logger.info("Validate SanPhamUpdate thành công")
        except Exception as e:
            current_app.logger.error(f"Lỗi validate SanPhamUpdate: {str(e)}")
            current_app.logger.error(f"Chi tiết lỗi: {traceback.format_exc()}")
            return jsonify({"error": f"Dữ liệu sản phẩm không hợp lệ: {str(e)}"}), 400
        
        # Gọi service cập nhật sản phẩm
        current_app.logger.info("Gọi service update_san_pham_with_variants...")
        updated_san_pham = SanPhamService.update_san_pham_with_variants(path.san_pham_id, san_pham_update)
        db.session.commit()
        current_app.logger.info("Cập nhật sản phẩm thành công")
        
        response = SanPhamResponse.model_validate(updated_san_pham)
        return jsonify(response.model_dump()), 200
        
    except (BadRequest, NotFound) as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi BadRequest/NotFound: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Lỗi cập nhật sản phẩm với ảnh: {traceback.format_exc()}")
        return jsonify({"error": f"Không thể cập nhật sản phẩm: {str(e)}"}), 500