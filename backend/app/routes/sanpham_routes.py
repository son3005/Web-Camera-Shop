# /backend/app/routes/product_routes.py

from flask import Blueprint, request, jsonify
from app.extensions import db, spec  # Import db và spec từ extensions
from flask_pydantic_spec import Request, Response
from typing import List

# Import decorator (giả sử bạn lưu ở app/utils/decorators.py)
from app.utils.decorators import admin_required

# Import Service và các lỗi nghiệp vụ
from app.services.sanpham_service import (
    SanPhamService, 
    ProductNotFound, 
    InvalidDataError, 
    SkuConflictError
)

# Import các Schema Pydantic từ các file bạn đã cung cấp
from app.schemas.sanpham import SanPhamCreate, SanPhamUpdate, SanPhamResponse
from app.schemas.Shared import PaginatedResponse, TrangThaiSanPhamEnum

# Tạo Blueprint
product_api = Blueprint('product_api', __name__, url_prefix='/api/products')


# --- ROUTE CHO ADMIN (Quản lý) ---

@product_api.route('/', methods=['POST'])
@admin_required()  # Yêu cầu quyền admin
@spec.validate(
    body=Request(SanPhamCreate), 
    resp=Response(HTTP_201=SanPhamResponse), 
    tags=['Admin - Sản Phẩm']
)
def create_product():
    """(Admin) Tạo một sản phẩm mới."""
    product_data: SanPhamCreate = request.context.body
    
    try:
        # 1. Gọi Service để thực thi logic nghiệp vụ
        new_product = SanPhamService.create_product(product_data)
        
        # 2. QUAN TRỌNG: Chỉ commit khi service thành công
        db.session.commit()
        
        # 3. Trả về response (pydantic-spec tự convert)
        return new_product, 201
        
    except (InvalidDataError, SkuConflictError) as e:
        # 4. Bắt lỗi nghiệp vụ (dữ liệu sai, SKU trùng)
        db.session.rollback()
        return jsonify(error=str(e)), 400
    except Exception as e:
        # 5. Bắt lỗi hệ thống
        db.session.rollback()
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500

@product_api.route('/<int:product_id>', methods=['PUT'])
@admin_required()
@spec.validate(
    body=Request(SanPhamUpdate), 
    resp=Response(HTTP_200=SanPhamResponse), 
    tags=['Admin - Sản Phẩm']
)
def update_product(product_id: int):
    """(Admin) Cập nhật thông tin một sản phẩm."""
    update_data: SanPhamUpdate = request.context.body
    
    try:
        # 1. Lấy sản phẩm hiện tại
        product_to_update = SanPhamService.get_product_by_id(product_id)
        
        # 2. Gọi Service để thực thi logic cập nhật
        updated_product = SanPhamService.update_product(product_to_update, update_data)
        
        # 3. Commit
        db.session.commit()
        
        return updated_product, 200

    except ProductNotFound as e:
        db.session.rollback()
        return jsonify(error=str(e)), 404
    except (InvalidDataError, SkuConflictError) as e:
        db.session.rollback()
        return jsonify(error=str(e)), 400
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500

@product_api.route('/<int:product_id>', methods=['DELETE'])
@admin_required()
@spec.validate(
    resp=Response(HTTP_204=None), # 204 No Content
    tags=['Admin - Sản Phẩm']
)
def delete_product(product_id: int):
    """(Admin) Xóa một sản phẩm."""
    try:
        # 1. Lấy sản phẩm
        product_to_delete = SanPhamService.get_product_by_id(product_id)
        
        # 2. Gọi Service
        SanPhamService.delete_product(product_to_delete)
        
        # 3. Commit
        db.session.commit()
        
        return "", 204
        
    except ProductNotFound as e:
        db.session.rollback()
        return jsonify(error=str(e)), 404
    except Exception as e:
        db.session.rollback()
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500

# --- ROUTE CHO PUBLIC (Khách hàng xem) ---

@product_api.route('/', methods=['GET'])
@spec.validate(
    resp=Response(HTTP_200=PaginatedResponse[SanPhamResponse]), 
    tags=['Sản Phẩm (Public)']
)
def get_all_products():
    """
    (Public) Lấy danh sách sản phẩm (có phân trang, bộ lọc VÀ sắp xếp).
    """
    
    # 1. Lấy tham số phân trang
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # 2. Lấy tham số cho bộ lọc
    filters = {}
    if request.args.get('danh_muc_id'):
        filters['danh_muc_id'] = request.args.get('danh_muc_id', type=int)
    if request.args.get('thuong_hieu_id'):
        filters['thuong_hieu_id'] = request.args.get('thuong_hieu_id', type=int)
    if request.args.get('search_term'):
        filters['search_term'] = request.args.get('search_term', type=str)
    if request.args.get('min_price'):
        filters['min_price'] = request.args.get('min_price', type=float)
    if request.args.get('max_price'):
        filters['max_price'] = request.args.get('max_price', type=float)
    
    # Mặc định, trang public chỉ xem các sản phẩm 'DANG_BAN'
    filters['trang_thai'] = request.args.get('trang_thai', TrangThaiSanPhamEnum.DANG_BAN.value)

    # 3. Lấy tham số sắp xếp
    sort_by = request.args.get('sort_by', None, type=str) # VD: 'price', 'name'
    sort_order = request.args.get('sort_order', 'desc', type=str) # VD: 'asc', 'desc'
    
    if sort_order not in ['asc', 'desc']:
        sort_order = 'desc'

    try:
        # 4. Gọi Service với đầy đủ tham số
        pagination = SanPhamService.get_all_products(
            page=page, 
            per_page=per_page, 
            filters=filters,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        # 5. Chuyển đổi data sang Pydantic Response
        items_response = [SanPhamResponse.from_orm(p) for p in pagination.items]
        
        # 6. Tạo response phân trang chuẩn (từ Shared.py)
        pag_response = PaginatedResponse(
            items=items_response,
            page=pagination.page,
            per_page=pagination.per_page,
            total_items=pagination.total,
            total_pages=pagination.pages
        )
        
        return jsonify(pag_response.dict()), 200
        
    except Exception as e:
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500

@product_api.route('/<int:product_id>', methods=['GET'])
@spec.validate(
    resp=Response(HTTP_200=SanPhamResponse), 
    tags=['Sản Phẩm (Public)']
)
def get_product(product_id: int):
    """(Public) Lấy chi tiết một sản phẩm theo ID."""
    try:
        product = SanPhamService.get_product_by_id(product_id)
        
        # Kiểm tra xem sản phẩm có được phép xem không
        if product.trang_thai != TrangThaiSanPhamEnum.DANG_BAN:
             # Nếu đây không phải admin, thì không cho xem
             # (Cần check quyền admin ở đây nếu bạn muốn admin xem được)
            raise ProductNotFound(f"Không tìm thấy sản phẩm với ID {product_id}")
            
        return product, 200
        
    except ProductNotFound as e:
        return jsonify(error=str(e)), 404
    except Exception as e:
        return jsonify(error=f"Lỗi máy chủ: {str(e)}"), 500