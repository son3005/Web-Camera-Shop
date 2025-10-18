# /backend/app/services/sanpham_service.py
from app.extensions import db
from app.models.sanpham import SanPham
from app.models.sanpham import BienTheSanPham
from app.models.sanpham import HinhAnhSanPham
from app.models.sanpham.DanhMuc import DanhMuc
from app.models.sanpham.ThuongHieu import ThuongHieu
from app.schemas.sanpham import SanPhamCreate, SanPhamUpdate, TrangThaiUpdate 
from app.services.cloudinary_service import CloudinaryService
from app.schemas.Shared import TrangThaiSanPhamEnum

from sqlalchemy.orm import joinedload
from sqlalchemy import text 
from typing import Dict, Any, List


class ServiceError(Exception):
    """Lỗi nghiệp vụ chung"""
    pass

class ProductNotFound(ServiceError):
    """Không tìm thấy sản phẩm"""
    pass

class InvalidDataError(ServiceError):
    """Dữ liệu đầu vào không hợp lệ (VD: ID không tồn tại)"""
    pass

class SkuConflictError(ServiceError):
    """Lỗi trùng lặp SKU"""
    pass

class SanPhamService:
    """
    Lớp Service chứa toàn bộ logic nghiệp vụ cho việc quản lý sản phẩm.
    Service không bao giờ gọi db.session.commit().
    """

    @staticmethod
    def get_all_products(page: int, per_page: int, 
                         filters: Dict[str, Any] = None, 
                         sort_by: str = None, 
                         sort_order: str = 'desc'):
        """
        Lấy danh sách sản phẩm với phân trang, lọc và sắp xếp.
        Hỗ trợ lọc theo danh mục, thương hiệu, trạng thái, khoảng giá và
        tìm kiếm từ khóa.
        Hỗ trợ sắp xếp theo giá, tên hoặc ngày tạo.
        """
        query = SanPham.query.options(
            joinedload(SanPham.thuong_hieu),
            joinedload(SanPham.danh_muc)
        )
        
        needs_join_or_distinct = False

        if filters:
            if filters.get('danh_muc_id'):
                query = query.filter(SanPham.danh_muc_id == filters['danh_muc_id'])
            if filters.get('thuong_hieu_id'):
                query = query.filter(SanPham.thuong_hieu_id == filters['thuong_hieu_id'])
            if filters.get('trang_thai'):
                try:
                    status_enum = TrangThaiSanPhamEnum(filters['trang_thai'])
                    query = query.filter(SanPham.trang_thai == status_enum)
                except ValueError:
                    pass 

            if filters.get('search_term'):
                search_term = filters['search_term']
                query = query.filter(
                    text("MATCH(ten_san_pham, mo_ta) AGAINST(:search_term IN BOOLEAN MODE)")
                ).params(search_term=f"+{search_term}*")

            if filters.get('min_price') or filters.get('max_price'):
                if not needs_join_or_distinct:
                    query = query.join(SanPham.cac_bien_the)
                    needs_join_or_distinct = True
            if filters.get('min_price'):
                query = query.filter(BienTheSanPham.gia >= filters['min_price'])
            if filters.get('max_price'):
                query = query.filter(BienTheSanPham.gia <= filters['max_price'])

        # Xử lý Sắp xếp
        order_field = None
        sort_direction = sort_order.lower()
        
        if sort_by == 'price':
            if not needs_join_or_distinct:
                query = query.join(SanPham.cac_bien_the)
                needs_join_or_distinct = True
            order_field = BienTheSanPham.gia.asc() if sort_direction == 'asc' else BienTheSanPham.gia.desc()
        elif sort_by == 'name':
            order_field = SanPham.ten_san_pham.asc() if sort_direction == 'asc' else SanPham.ten_san_pham.desc()
        
        if order_field is None:
            order_field = SanPham.ngay_tao.desc() 
            
        query = query.order_by(order_field)

        if needs_join_or_distinct:
            query = query.distinct()

        return query.paginate(page=page, per_page=per_page, error_out=False)

    @staticmethod
    def get_product_by_id(product_id: int) -> SanPham:
        """
        Tìm sản phẩm theo ID và ném lỗi tùy chỉnh.
        Tải sẵn toàn bộ biến thể và hình ảnh.
        """
        product = SanPham.query.options(
            joinedload(SanPham.cac_bien_the).joinedload(BienTheSanPham.hinh_anhs),
            joinedload(SanPham.danh_muc),
            joinedload(SanPham.thuong_hieu)
        ).get(product_id)
        
        if not product:
            raise ProductNotFound(f"Không tìm thấy sản phẩm với ID {product_id}")
        return product

    @staticmethod
    def create_product(product_data: SanPhamCreate) -> SanPham:
        """
        Logic nghiệp vụ để tạo một sản phẩm mới.
        """
        data = product_data.dict()

        if not db.session.get(DanhMuc, data['danh_muc_id']):
            raise InvalidDataError(f"Danh mục ID {data['danh_muc_id']} không tồn tại.")
        if not db.session.get(ThuongHieu, data['thuong_hieu_id']):
            raise InvalidDataError(f"Thương hiệu ID {data['thuong_hieu_id']} không tồn tại.")

        variants_data = data.pop('cac_bien_the', [])
        
        SanPhamService._check_sku_uniqueness([v['ma_sku'] for v in variants_data])

        new_product = SanPham(**data)
        db.session.add(new_product)
        db.session.flush() # Flush để lấy ID và chạy event listener tạo mã SP

        for variant_data in variants_data:
            images_data = variant_data.pop('hinh_anhs', [])
            
            new_variant = BienTheSanPham(
                san_pham_goc_id=new_product.id, 
                **variant_data
            )
            db.session.add(new_variant)
            db.session.flush()

            SanPhamService._sync_images(new_variant, images_data)
        
        return new_product

    @staticmethod
    def update_product(product: SanPham, product_data: SanPhamUpdate) -> SanPham:
        """
        Logic nghiệp vụ để cập nhật một sản phẩm.
        """
        update_data = product_data.dict(exclude_unset=True)
        variants_data = update_data.pop('cac_bien_the', None) # Lấy data biến thể
        
        for key, value in update_data.items():
            setattr(product, key, value)
        
        if variants_data is not None:
            # Dùng hàm sync an toàn
            SanPhamService._update_variants(product, variants_data)
            
        return product

    @staticmethod
    def update_product_status(product: SanPham, status_data: TrangThaiUpdate) -> SanPham:
        """
        Cập nhật trạng thái của sản phẩm.
        """
        try:
            new_status = TrangThaiSanPhamEnum(status_data.trang_thai)
            product.trang_thai = new_status
            return product
        except ValueError:
            valid_statuses = [item.value for item in TrangThaiSanPhamEnum]
            raise ValueError(f"Trạng thái không hợp lệ. Chỉ chấp nhận: {', '.join(valid_statuses)}")

    @staticmethod
    def delete_product(product: SanPham) -> None:
        """
        Xóa một sản phẩm.
        """
        db.session.delete(product)

    # --- CÁC HÀM HELPER AN TOÀN ---

    @staticmethod
    def _check_sku_uniqueness(skus: List[str], current_product_id: int = None):
        """(CẢI TIẾN AN TOÀN) Helper kiểm tra SKU."""
        if not skus:
            return
        if len(skus) != len(set(skus)):
            raise SkuConflictError("SKU bị trùng lặp trong chính request.")
        
        query = BienTheSanPham.query.filter(BienTheSanPham.ma_sku.in_(skus))
        if current_product_id:
            query = query.filter(BienTheSanPham.san_pham_goc_id != current_product_id)
            
        conflicting_sku = query.first()
        if conflicting_sku:
            raise SkuConflictError(f"SKU '{conflicting_sku.ma_sku}' đã tồn tại.")

    @staticmethod
    def _update_variants(product: SanPham, variants_data: List[Dict]):
        """ Đồng bộ các biến thể (Thêm/Sửa/Xóa)."""
        existing_variants_map = {v.id: v for v in product.cac_bien_the}
        
        skus_to_check = [v['ma_sku'] for v in variants_data if 'ma_sku' in v]
        SanPhamService._check_sku_uniqueness(skus_to_check, current_product_id=product.id)

        variants_to_keep = []
        for v_data in variants_data:
            images_data = v_data.pop('hinh_anhs', [])
            variant_id = v_data.get('id')

            if variant_id and variant_id in existing_variants_map:
                # CẬP NHẬT
                variant_to_update = existing_variants_map.pop(variant_id)
                for key, value in v_data.items():
                    setattr(variant_to_update, key, value)
                SanPhamService._sync_images(variant_to_update, images_data)
                variants_to_keep.append(variant_to_update)
            else:
                # THÊM MỚI
                v_data.pop('id', None)
                new_variant = BienTheSanPham(san_pham_goc_id=product.id, **v_data)
                SanPhamService._sync_images(new_variant, images_data)
                variants_to_keep.append(new_variant)

        # tự động xóa các biến thể còn sót lại trong 'existing_variants_map'.
        product.cac_bien_the = variants_to_keep

    @staticmethod
    def _sync_images(variant: BienTheSanPham, images_data: List[Dict]):
        """
        Đồng bộ hình ảnh (Thêm/Sửa/Xóa)
        VÀ gọi Celery task để xóa ảnh trên Cloudinary.
        """
        # (Logic xử lý ảnh đại diện giữ nguyên)
        has_thumbnail = False
        for img_data in images_data:
            if img_data.get('la_anh_dai_dien'):
                if has_thumbnail:
                    img_data['la_anh_dai_dien'] = False
                else:
                    has_thumbnail = True
        if not has_thumbnail and images_data:
            images_data[0]['la_anh_dai_dien'] = True
            
        # --- Logic đồng bộ (Thêm/Sửa/Xóa) ---
        existing_images_map = {img.id: img for img in variant.hinh_anhs}
        incoming_image_ids = {img['id'] for img in images_data if 'id' in img}
        
        images_to_keep = []

        # 1. Xử lý Thêm / Cập nhật
        for img_data in images_data:
            img_id = img_data.get('id')
            if img_id and img_id in existing_images_map:
                # CẬP NHẬT
                image_to_update = existing_images_map.pop(img_id) 
                for key, value in img_data.items():
                    setattr(image_to_update, key, value)
                images_to_keep.append(image_to_update)
            else:
                # THÊM MỚI 
                img_data.pop('id', None)
                if 'public_id' not in img_data or 'url' not in img_data:
                    continue 
                new_image = HinhAnhSanPham(bien_the_id=variant.id, **img_data)
                images_to_keep.append(new_image)
        
        # 2. Xử lý Xóa 
        ids_to_delete = existing_images_map.keys()
        for img_id in ids_to_delete:
            image_to_delete = existing_images_map[img_id]
            
            # Lấy public_id và gọi Celery task
            public_id_to_delete = image_to_delete.public_id
            CloudinaryService.delete_image_task.delay(public_id_to_delete)
            pass 

        # (CẢI TIẾN AN TOÀN) Gán lại list
        variant.hinh_anhs = images_to_keep