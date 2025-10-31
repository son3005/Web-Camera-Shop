# app/routes/san_pham_routes.py
from ..extensions import db
from flask import Blueprint, request, jsonify
from werkzeug.exceptions import BadRequest, NotFound
from ..services.sanpham_service import SanPhamService
from ..services.cloudinary_service import CloudinaryService  # IMPORT cho delete ảnh
from ..models.sanpham import SanPham, BienTheSanPham, HinhAnhSanPham
from ..schemas.sanpham import SanPhamCreate, SanPhamUpdate, SanPhamResponse
from ..schemas.sanpham import BienTheSanPhamCreate, BienTheSanPhamResponse, BienTheSanPhamUpdate
from ..schemas.sanpham import HinhAnhCreate  # Thêm cho update ảnh
from sqlalchemy.orm import selectinload
from typing import List
from ..utils.decorators import admin_required
from flask_pydantic_spec import Response  # Để validate response
from ..extensions import spec

product_api = Blueprint('product_api', __name__, url_prefix='/api/v1/san-pham')


# ===================================================================
# 1. LẤY DANH SÁCH SẢN PHẨM (FILTER + SEARCH + SORT + PAGINATION)
# ===================================================================
@product_api.route('', methods=['GET'])
@spec.validate(resp=Response(HTTP_200=SanPhamResponse), tags=['SanPham'])  # Thêm spec
def get_all_san_pham():
    """
    Lấy danh sách sản phẩm với:
    - page, per_page
    - search (FULLTEXT)
    - min_price, max_price
    - sort_by: price_asc, price_desc, name_asc, name_desc
    - thuong_hieu_ids: [1,2,3]
    - danh_muc_ids: [1,2]
    """
    try:
        # Query params
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', None, type=str)
        min_price = request.args.get('min_price', None, type=float)
        max_price = request.args.get('max_price', None, type=float)
        sort_by = request.args.get('sort_by', None, type=str)
        thuong_hieu_ids = request.args.getlist('thuong_hieu_ids', type=int)
        danh_muc_ids = request.args.getlist('danh_muc_ids', type=int)

        # Validate sort_by
        valid_sorts = ['price_asc', 'price_desc', 'name_asc', 'name_desc']
        if sort_by and sort_by not in valid_sorts:
            raise BadRequest("sort_by phải là: price_asc, price_desc, name_asc, name_desc")

        # Gọi service (đã có pagination đầy đủ)
        result = SanPhamService.get_all_san_pham(
            page=page,
            per_page=per_page,
            search=search,
            min_price=min_price,
            max_price=max_price,
            sort_by=sort_by,
            thuong_hieu_ids=thuong_hieu_ids,
            danh_muc_ids=danh_muc_ids
        )

        return jsonify(result), 200  # result đã là dict với data + pagination

    except Exception as e:
        raise BadRequest(str(e))

# ===================================================================
# 2. LẤY CHI TIẾT SẢN PHẨM
# ===================================================================
@product_api.route('/<int:san_pham_id>', methods=['GET'])
@spec.validate(resp=Response(HTTP_200=SanPhamResponse), tags=['SanPham'])
def get_san_pham(san_pham_id: int):
    try:
        product = SanPhamService.get_san_pham_by_id(san_pham_id)
        return jsonify(product.dict()), 200
    except NotFound:
        raise NotFound("Sản phẩm không tồn tại")

# ===================================================================
# 3. TẠO SẢN PHẨM MỚI (CLIENT ĐÃ UPLOAD ẢNH → GỬI URL + PUBLIC_ID)
# ===================================================================
@product_api.route('', methods=['POST'])
@admin_required
@spec.validate(resp=Response(HTTP_201=SanPhamResponse), tags=['SanPham'])
def create_san_pham():
    """
    Tạo sản phẩm mới từ JSON body.
    """
    try:
        data = SanPhamCreate(**request.get_json())  # Validate bằng Pydantic
        new_product = SanPhamService.create_san_pham(data)
        return jsonify(new_product.dict()), 201
    except Exception as e:
        db.session.rollback()
        raise BadRequest(f"Lỗi tạo sản phẩm: {str(e)}")

# ===================================================================
# 4. CẬP NHẬT SẢN PHẨM
# ===================================================================
@product_api.route('/<int:san_pham_id>', methods=['PUT'])
@admin_required
@spec.validate(resp=Response(HTTP_200=SanPhamResponse), tags=['SanPham'])
def update_san_pham(san_pham_id: int):
    """
    Cập nhật sản phẩm từ JSON body.
    """
    try:
        data = SanPhamUpdate(**request.get_json())
        updated_product = SanPhamService.update_san_pham(san_pham_id, data)
        return jsonify(updated_product.dict()), 200
    except Exception as e:
        db.session.rollback()
        raise BadRequest(f"Lỗi cập nhật sản phẩm: {str(e)}")

# ===================================================================
# 5. XÓA SẢN PHẨM (MỚI THÊM)
# ===================================================================
@product_api.route('/<int:san_pham_id>', methods=['DELETE'])
@admin_required
@spec.validate(tags=['SanPham'])
def delete_san_pham(san_pham_id: int):
    """
    Xóa sản phẩm theo ID.
    """
    try:
        result = SanPhamService.delete_san_pham(san_pham_id)
        return jsonify(result), 200
    except Exception as e:
        db.session.rollback()
        raise BadRequest(f"Lỗi xóa sản phẩm: {str(e)}")

# ===================================================================
# 6. TẠO BIẾN THỂ MỚI
# ===================================================================
@product_api.route('/<int:san_pham_id>/bien-the', methods=['POST'])
@admin_required
@spec.validate(resp=Response(HTTP_201=BienTheSanPhamResponse), tags=['BienThe'])
def create_bien_the(san_pham_id: int):
    """
    Tạo biến thể mới cho sản phẩm.
    Body JSON: BienTheSanPhamCreate với hinh_anhs (url + public_id từ client upload).
    """
    try:
        data = BienTheSanPhamCreate(**request.get_json())

        # Kiểm tra sản phẩm tồn tại
        if not SanPham.query.get(san_pham_id):
            raise NotFound("Sản phẩm không tồn tại")

        # Tạo biến thể
        new_variant = BienTheSanPham(
            san_pham_id=san_pham_id,
            ten_bien_the=data.ten_bien_the,
            trang_thai_kich_hoat=data.trang_thai_kich_hoat,
            gia_ban=data.gia_ban,
            gia_khuyen_mai=data.gia_khuyen_mai,
            ngay_bat_dau_khuyen_mai=data.ngay_bat_dau_khuyen_mai,
            ngay_ket_thuc_khuyen_mai=data.ngay_ket_thuc_khuyen_mai,
            so_luong_ton=data.so_luong_ton
        )
        db.session.add(new_variant)
        db.session.flush()

        # Thêm ảnh (từ client upload)
        if data.hinh_anhs:
            for img_data in data.hinh_anhs:
                img = HinhAnhSanPham(
                    bien_the_id=new_variant.id,
                    url=img_data.url,
                    public_id=img_data.public_id,
                    alt_text=img_data.alt_text,
                    la_anh_dai_dien=img_data.la_anh_dai_dien
                )
                db.session.add(img)

        db.session.commit()
        return jsonify(BienTheSanPhamResponse.from_orm(new_variant).dict()), 201

    except Exception as e:
        db.session.rollback()
        raise BadRequest(f"Lỗi tạo biến thể: {str(e)}")

# ===================================================================
# 7. CẬP NHẬT BIẾN THỂ (HỖ TRỢ ẢNH MỚI + XÓA ẢNH CŨ)
# ===================================================================
@product_api.route('/<int:san_pham_id>/bien-the/<int:bien_the_id>', methods=['PUT'])
@admin_required
@spec.validate(resp=Response(HTTP_200=BienTheSanPhamResponse), tags=['BienThe'])
def update_bien_the(san_pham_id: int, bien_the_id: int):
    """
    Cập nhật biến thể (giá, tồn, ảnh).
    Body JSON: BienTheSanPhamUpdate + tùy chọn 'new_hinh_anhs' (list HinhAnhCreate) và 'deleted_hinh_anh_ids' (list int).
    """
    try:
        variant = BienTheSanPham.query.filter_by(
            id=bien_the_id, san_pham_id=san_pham_id
        ).options(selectinload(BienTheSanPham.hinh_anhs)).first()
        if not variant:
            raise NotFound("Biến thể không tồn tại")

        # Lấy data từ JSON (Pydantic không validate extra fields, nên manual)
        json_data = request.get_json()
        data = BienTheSanPhamUpdate(**json_data)

        # Update fields chính
        if data.ten_bien_the is not None:
            variant.ten_bien_the = data.ten_bien_the
        if data.gia_ban is not None:
            variant.gia_ban = data.gia_ban
        if data.gia_khuyen_mai is not None:
            variant.gia_khuyen_mai = data.gia_khuyen_mai
        if data.ngay_bat_dau_khuyen_mai is not None:
            variant.ngay_bat_dau_khuyen_mai = data.ngay_bat_dau_khuyen_mai
        if data.ngay_ket_thuc_khuyen_mai is not None:
            variant.ngay_ket_thuc_khuyen_mai = data.ngay_ket_thuc_khuyen_mai
        if data.so_luong_ton is not None:
            variant.so_luong_ton = data.so_luong_ton
        if data.trang_thai_kich_hoat is not None:
            variant.trang_thai_kich_hoat = data.trang_thai_kich_hoat

        # Xử lý ảnh mới (add)
        new_hinh_anhs = json_data.get('new_hinh_anhs', [])
        for img_data in new_hinh_anhs:
            new_img = HinhAnhSanPham(
                bien_the_id=variant.id,
                url=img_data['url'],
                public_id=img_data['public_id'],
                alt_text=img_data.get('alt_text'),
                la_anh_dai_dien=img_data.get('la_anh_dai_dien', False)
            )
            db.session.add(new_img)

        # Xử lý xóa ảnh cũ
        deleted_hinh_anh_ids = json_data.get('deleted_hinh_anh_ids', [])
        public_ids_to_delete = []
        for img_id in deleted_hinh_anh_ids:
            img = next((i for i in variant.hinh_anhs if i.id == img_id), None)
            if img:
                public_ids_to_delete.append(img.public_id)
                db.session.delete(img)

        db.session.commit()

        # Trigger xóa ảnh trên Cloudinary (async)
        for public_id in public_ids_to_delete:
            if public_id:
                CloudinaryService.delete_image_task.delay(public_id)

        return jsonify(BienTheSanPhamResponse.from_orm(variant).dict()), 200

    except Exception as e:
        db.session.rollback()
        raise BadRequest(f"Lỗi cập nhật biến thể: {str(e)}")

# ===================================================================
# 8. XÓA BIẾN THỂ (CASCADE XÓA ẢNH + CELERY XÓA CLOUDINARY)
# ===================================================================
@product_api.route('/<int:san_pham_id>/bien-the/<int:bien_the_id>', methods=['DELETE'])
@admin_required
@spec.validate(tags=['BienThe'])
def delete_bien_the(san_pham_id: int, bien_the_id: int):
    try:
        variant = BienTheSanPham.query.filter_by(
            id=bien_the_id, san_pham_id=san_pham_id
        ).options(selectinload(BienTheSanPham.hinh_anhs)).first()
        if not variant:
            raise NotFound("Biến thể không tồn tại")

        # Thu thập public_ids trước xóa
        public_ids = [img.public_id for img in variant.hinh_anhs if img.public_id]

        db.session.delete(variant)
        db.session.commit()

        # Trigger xóa ảnh trên Cloudinary
        for public_id in public_ids:
            CloudinaryService.delete_image_task.delay(public_id)

        return jsonify({"message": "Xóa biến thể thành công"}), 200

    except Exception as e:
        db.session.rollback()
        raise BadRequest(f"Lỗi xóa biến thể: {str(e)}")