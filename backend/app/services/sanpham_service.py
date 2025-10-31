# app/services/sanpham_service.py
from ..extensions import db
from ..models.sanpham import SanPham, BienTheSanPham, HinhAnhSanPham, DanhMuc, ThuongHieu
from ..schemas.sanpham import SanPhamCreate, SanPhamUpdate, SanPhamResponse
from ..schemas.sanpham import BienTheSanPhamCreate
from ..schemas.sanpham import HinhAnhCreate
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import NotFound, BadRequest
from sqlalchemy import func, case, null
from sqlalchemy.orm import joinedload, selectinload
from ..utils.taoMa import generate_unique_ma_san_pham
from .cloudinary_service import CloudinaryService
import logging  # THÊM logging

logger = logging.getLogger(__name__)  # THÊM

class ProductNotFound(NotFound):
    def __init__(self, message="Sản phẩm không tồn tại"):
        super().__init__(description=message)
class SanPhamService:

    @staticmethod
    def get_all_san_pham(
        page=1,
        per_page=10,
        search=None,
        min_price=None,
        max_price=None,
        sort_by=None,
        thuong_hieu_ids=None,
        danh_muc_ids=None
    ):
        """
        Lấy list sản phẩm với phân trang, search, lọc giá, sắp xếp, lọc thương hiệu/danh mục.
        SỬA: Dùng joinedload để tránh N+1 query
        """
        query = SanPham.query.options(
            joinedload(SanPham.danh_muc),
            joinedload(SanPham.thuong_hieu),
            selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
        )

        # Lọc theo danh mục
        if danh_muc_ids:
            query = query.filter(SanPham.danh_muc_id.in_(danh_muc_ids))

        # Lọc theo thương hiệu
        if thuong_hieu_ids:
            query = query.filter(SanPham.thuong_hieu_id.in_(thuong_hieu_ids))

        # Search FULLTEXT
        if search:
            query = query.filter(
                func.match(SanPham.ten_san_pham, SanPham.mo_ta).against(search, in_boolean_mode=True)
            )

        # SỬA: Effective price cho filter/sort
        effective_price = case(
            (
                (BienTheSanPham.gia_khuyen_mai.is_not(null())) &
                (BienTheSanPham.ngay_bat_dau_khuyen_mai <= func.now()) &
                (BienTheSanPham.ngay_ket_thuc_khuyen_mai >= func.now()),
                BienTheSanPham.gia_khuyen_mai
            ),
            else_=BienTheSanPham.gia_ban
        )

        price_subquery = (
            db.session.query(
                BienTheSanPham.san_pham_id,
                func.min(effective_price).label('min_effective_price')
            )
            .group_by(BienTheSanPham.san_pham_id)
            .subquery()
        )

        # Lọc giá
        if min_price is not None or max_price is not None:
            query = query.join(price_subquery, price_subquery.c.san_pham_id == SanPham.id)
            if min_price is not None:
                query = query.filter(price_subquery.c.min_effective_price >= min_price)
            if max_price is not None:
                query = query.filter(price_subquery.c.min_effective_price <= max_price)

        # Sắp xếp
        if sort_by in ['price_asc', 'price_desc']:
            query = query.join(price_subquery, price_subquery.c.san_pham_id == SanPham.id)
            if sort_by == 'price_asc':
                query = query.order_by(price_subquery.c.min_effective_price.asc())
            else:
                query = query.order_by(price_subquery.c.min_effective_price.desc())
        elif sort_by == 'name_asc':
            query = query.order_by(SanPham.ten_san_pham.asc())
        elif sort_by == 'name_desc':
            query = query.order_by(SanPham.ten_san_pham.desc())

        # Phân trang
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        products = pagination.items
        return {
            "data": [SanPhamResponse.from_orm(p).dict() for p in products],
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }

    @staticmethod
    def get_san_pham_by_id(san_pham_id: int):
        """
        Lấy chi tiết sản phẩm theo ID.
        SỬA: Dùng joinedload để tránh N+1
        """
        product = SanPham.query.options(
            joinedload(SanPham.danh_muc),
            joinedload(SanPham.thuong_hieu),
            selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
        ).get(san_pham_id)

        if not product:
            raise NotFound("Sản phẩm không tồn tại")
        return SanPhamResponse.from_orm(product)

    @staticmethod
    def create_san_pham(data: SanPhamCreate):
        """
        Tạo sản phẩm mới, bao gồm variants và images.
        SỬA: 
          - generate_unique_ma_san_pham
          - sửa lỗi logic la_anh_dai_dien
        """
        try:
            # Kiểm tra danh mục và thương hiệu
            danh_muc = DanhMuc.query.get(data.danh_muc_id)
            if not danh_muc:
                raise BadRequest("Danh mục không tồn tại")

            thuong_hieu = ThuongHieu.query.get(data.thuong_hieu_id)
            if not thuong_hieu:
                raise BadRequest("Thương hiệu không tồn tại")

            # Tạo mã sản phẩm DUY NHẤT
            ma_san_pham = generate_unique_ma_san_pham(danh_muc.ma_danh_muc, thuong_hieu.ma_thuong_hieu)

            # Tạo sản phẩm
            new_product = SanPham(
                ma_san_pham=ma_san_pham,
                danh_muc_id=data.danh_muc_id,
                thuong_hieu_id=data.thuong_hieu_id,
                ten_san_pham=data.ten_san_pham,
                mo_ta=data.mo_ta,
                thong_so_ky_thuat=data.thong_so_ky_thuat,
                trang_thai=data.trang_thai
            )
            db.session.add(new_product)
            db.session.flush()

            # Tạo biến thể
            for variant_data in data.bien_the_san_phams:
                new_variant = BienTheSanPham(
                    san_pham_id=new_product.id,
                    ten_bien_the=variant_data.ten_bien_the,
                    trang_thai_kich_hoat=variant_data.trang_thai_kich_hoat,
                    gia_ban=variant_data.gia_ban,
                    gia_khuyen_mai=variant_data.gia_khuyen_mai,
                    ngay_bat_dau_khuyen_mai=variant_data.ngay_bat_dau_khuyen_mai,
                    ngay_ket_thuc_khuyen_mai=variant_data.ngay_ket_thuc_khuyen_mai,
                    so_luong_ton=variant_data.so_luong_ton
                )
                db.session.add(new_variant)
                db.session.flush()

                # Hình ảnh cho biến thể
                images_to_add = []
                has_main_image = False

                if hasattr(variant_data, 'hinh_anhs') and variant_data.hinh_anhs:
                    for img_data in variant_data.hinh_anhs:
                        img = HinhAnhSanPham(
                            bien_the_id=new_variant.id,
                            url=img_data.url,
                            public_id=img_data.public_id,
                            alt_text=img_data.alt_text,
                            la_anh_dai_dien=img_data.la_anh_dai_dien
                        )
                        images_to_add.append(img)
                        if img_data.la_anh_dai_dien:
                            has_main_image = True

                    # Đảm bảo có ít nhất 1 ảnh đại diện
                    if not has_main_image and images_to_add:
                        images_to_add[0].la_anh_dai_dien = True

                    for img in images_to_add:
                        db.session.add(img)

            db.session.commit()
            return SanPhamResponse.from_orm(new_product)

        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"Lỗi tích hợp: {str(e)}")  # SỬA: Logging
            raise BadRequest(f"Lỗi tích hợp: {str(e)}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi tạo sản phẩm: {str(e)}")  # SỬA: Logging
            raise BadRequest(f"Lỗi tạo sản phẩm: {str(e)}")

    @staticmethod
    def update_san_pham(san_pham_id: int, data: SanPhamUpdate):
        product = SanPham.query.get(san_pham_id)
        if not product:
            raise NotFound("Sản phẩm không tồn tại")

        if data.danh_muc_id:
            if not DanhMuc.query.get(data.danh_muc_id):
                raise BadRequest("Danh mục không tồn tại")
            product.danh_muc_id = data.danh_muc_id

        if data.thuong_hieu_id:
            if not ThuongHieu.query.get(data.thuong_hieu_id):
                raise BadRequest("Thương hiệu không tồn tại")
            product.thuong_hieu_id = data.thuong_hieu_id

        if data.ten_san_pham:
            product.ten_san_pham = data.ten_san_pham

        if data.mo_ta is not None:
            product.mo_ta = data.mo_ta

        if data.thong_so_ky_thuat is not None:
            product.thong_so_ky_thuat = data.thong_so_ky_thuat

        if data.trang_thai:
            product.trang_thai = data.trang_thai

        db.session.commit()
        return SanPhamResponse.from_orm(product)

    @staticmethod
    def delete_san_pham(san_pham_id: int):
        """
        Xóa sản phẩm + trigger xóa ảnh trên Cloudinary (dùng CloudinaryService).
        """
        product = SanPham.query.options(
            selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
        ).get(san_pham_id)

        if not product:
            raise NotFound("Sản phẩm không tồn tại")

        public_ids = [
            img.public_id for variant in product.cac_bien_the
            for img in variant.hinh_anhs
            if img.public_id and img.public_id.strip()
        ]

        db.session.delete(product)
        db.session.commit()

        for public_id in public_ids:
            CloudinaryService.delete_image_task.delay(public_id)

        return {"message": "Sản phẩm đã xóa thành công. Ảnh đang được xóa trên Cloudinary..."}