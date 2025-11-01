# app/services/sanpham_service.py
from sqlalchemy.orm import joinedload, selectinload
from ..extensions import db
from ..models.sanpham import SanPham, BienTheSanPham, HinhAnhSanPham, DanhMuc, ThuongHieu
from ..schemas.sanpham import (
    SanPhamCreate, SanPhamUpdate, SanPhamResponse,
    BienTheSanPhamCreate, BienTheSanPhamUpdate, SanPhamListResponse,
    HinhAnhCreate
)
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import NotFound, BadRequest
from sqlalchemy import func, case, null, text
from ..utils.taoMa import generate_ma_san_pham
from .cloudinary_service import CloudinaryService
import logging

# Logger riêng cho service
logger = logging.getLogger(__name__)


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
        logger.info(
            f"GET /san-pham | page={page}, per_page={per_page}, search='{search}', "
            f"min_price={min_price}, max_price={max_price}, sort_by='{sort_by}', "
            f"thuong_hieu_ids={thuong_hieu_ids}, danh_muc_ids={danh_muc_ids}"
        )

        query = SanPham.query.options(
            joinedload(SanPham.danh_muc),
            joinedload(SanPham.thuong_hieu),
            selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
        )

        if danh_muc_ids:
            logger.debug(f"Lọc theo danh mục: {danh_muc_ids}")
            query = query.filter(SanPham.danh_muc_id.in_(danh_muc_ids))

        if thuong_hieu_ids:
            logger.debug(f"Lọc theo thương hiệu: {thuong_hieu_ids}")
            query = query.filter(SanPham.thuong_hieu_id.in_(thuong_hieu_ids))

        if search:
            logger.debug(f"Tìm kiếm FULLTEXT: '{search}'")
            query = query.filter(
                text("MATCH(ten_san_pham, mo_ta) AGAINST (:search IN BOOLEAN MODE)")
            ).params(search=search)

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

        need_price_join = (min_price is not None or max_price is not None or sort_by in ['price_asc', 'price_desc'])
        if need_price_join:
            logger.debug("JOIN subquery giá hiệu quả")
            query = query.join(price_subquery, price_subquery.c.san_pham_id == SanPham.id)

        if min_price is not None:
            logger.debug(f"Lọc giá >= {min_price}")
            query = query.filter(price_subquery.c.min_effective_price >= min_price)
        if max_price is not None:
            logger.debug(f"Lọc giá <= {max_price}")
            query = query.filter(price_subquery.c.min_effective_price <= max_price)

        if sort_by == 'price_asc':
            logger.debug("Sắp xếp giá tăng dần")
            query = query.order_by(price_subquery.c.min_effective_price.asc())
        elif sort_by == 'price_desc':
            logger.debug("Sắp xếp giá giảm dần")
            query = query.order_by(price_subquery.c.min_effective_price.desc())
        elif sort_by == 'name_asc':
            logger.debug("Sắp xếp tên A→Z")
            query = query.order_by(SanPham.ten_san_pham.asc())
        elif sort_by == 'name_desc':
            logger.debug("Sắp xếp tên Z→A")
            query = query.order_by(SanPham.ten_san_pham.desc())

        logger.debug(f"Phân trang: page={page}, per_page={per_page}")
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        data = [SanPhamResponse.model_validate(p).model_dump() for p in pagination.items]

        logger.info(f"Lấy danh sách sản phẩm thành công | total={pagination.total}, pages={pagination.pages}")
        return {
            "data": data,
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }

    @staticmethod
    def get_san_pham_by_id(san_pham_id: int):
        logger.info(f"GET /san-pham/{san_pham_id} | Lấy chi tiết sản phẩm")
        product = SanPham.query.options(
            joinedload(SanPham.danh_muc),
            joinedload(SanPham.thuong_hieu),
            selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
        ).get(san_pham_id)

        if not product:
            logger.warning(f"Không tìm thấy sản phẩm ID: {san_pham_id}")
            raise ProductNotFound()

        logger.info(f"Lấy chi tiết sản phẩm thành công | ID: {san_pham_id}")
        return SanPhamResponse.model_validate(product)

    @staticmethod
    def create_san_pham(data: SanPhamCreate):
        logger.info("POST /san-pham | Bắt đầu tạo sản phẩm mới")
        logger.debug(f"Input data: {data.model_dump()}")

        try:
            danh_muc = DanhMuc.query.get(data.danh_muc_id)
            if not danh_muc:
                logger.warning(f"Danh mục không tồn tại: ID={data.danh_muc_id}")
                raise BadRequest("Danh mục không tồn tại")

            thuong_hieu = ThuongHieu.query.get(data.thuong_hieu_id)
            if not thuong_hieu:
                logger.warning(f"Thương hiệu không tồn tại: ID={data.thuong_hieu_id}")
                raise BadRequest("Thương hiệu không tồn tại")

            sinh_ma_san_pham = None
            max_retries = 5
            for attempt in range(max_retries):
                code = generate_ma_san_pham(danh_muc.ma_danh_muc[:5], thuong_hieu.ma_thuong_hieu[:5])
                if not db.session.query(SanPham).filter_by(ma_san_pham=code).first():
                    sinh_ma_san_pham = code
                    logger.debug(f"Mã sản phẩm tạo thành công: {code}")
                    break
            else:
                logger.error("Không thể tạo mã sản phẩm duy nhất sau 5 lần thử")
                raise Exception("Không thể tạo mã sản phẩm duy nhất")

            new_product = SanPham(
                ma_san_pham=sinh_ma_san_pham,
                danh_muc_id=data.danh_muc_id,
                thuong_hieu_id=data.thuong_hieu_id,
                ten_san_pham=data.ten_san_pham,
                mo_ta=data.mo_ta,
                thong_so_ky_thuat=data.thong_so_ky_thuat,
                trang_thai=data.trang_thai
            )
            db.session.add(new_product)
            db.session.flush()
            logger.debug(f"Tạo sản phẩm thành công | ID: {new_product.id}")

            for idx, variant_data in enumerate(data.bien_the_san_phams, 1):
                logger.debug(f"Tạo biến thể {idx}/{len(data.bien_the_san_phams)}")
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

                images_to_add = []
                has_main_image = any(img.la_anh_dai_dien for img in variant_data.hinh_anhs) if variant_data.hinh_anhs else False

                for img_data in variant_data.hinh_anhs:
                    img = HinhAnhSanPham(
                        bien_the_id=new_variant.id,
                        url=img_data.url,
                        public_id=img_data.public_id,
                        alt_text=img_data.alt_text,
                        la_anh_dai_dien=img_data.la_anh_dai_dien
                    )
                    images_to_add.append(img)

                if not has_main_image and images_to_add:
                    images_to_add[0].la_anh_dai_dien = True
                    logger.debug("Tự động đặt ảnh đầu làm ảnh đại diện")

                for img in images_to_add:
                    db.session.add(img)

            db.session.commit()
            logger.info(f"Tạo sản phẩm THÀNH CÔNG | ID: {new_product.id}, Mã: {sinh_ma_san_pham}")

            reloaded = SanPham.query.options(
                joinedload(SanPham.danh_muc),
                joinedload(SanPham.thuong_hieu),
                selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
            ).get(new_product.id)

            return reloaded

        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"IntegrityError khi tạo sản phẩm: {e}", exc_info=True)
            raise BadRequest("Dữ liệu vi phạm ràng buộc cơ sở dữ liệu")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi không xác định khi tạo sản phẩm: {e}", exc_info=True)
            raise BadRequest(f"Lỗi tạo sản phẩm: {str(e)}")

    @staticmethod
    def update_san_pham(san_pham_id: int, data: SanPhamUpdate):
        logger.info(f"PUT /san-pham/{san_pham_id} | Cập nhật sản phẩm")
        logger.debug(f"Input data: {data.model_dump(exclude_unset=True)}")

        product = SanPham.query.get(san_pham_id)
        if not product:
            logger.warning(f"Không tìm thấy sản phẩm ID: {san_pham_id}")
            raise ProductNotFound()

        updated = False
        if data.danh_muc_id is not None:
            danh_muc = DanhMuc.query.get(data.danh_muc_id)
            if not danh_muc:
                logger.warning(f"Danh mục không tồn tại: {data.danh_muc_id}")
                raise BadRequest("Danh mục không tồn tại")
            product.danh_muc_id = data.danh_muc_id
            updated = True

        if data.thuong_hieu_id is not None:
            thuong_hieu = ThuongHieu.query.get(data.thuong_hieu_id)
            if not thuong_hieu:
                logger.warning(f"Thương hiệu không tồn tại: {data.thuong_hieu_id}")
                raise BadRequest("Thương hiệu không tồn tại")
            product.thuong_hieu_id = data.thuong_hieu_id
            updated = True

        if data.ten_san_pham is not None:
            product.ten_san_pham = data.ten_san_pham
            updated = True
        if data.mo_ta is not None:
            product.mo_ta = data.mo_ta
            updated = True
        if data.thong_so_ky_thuat is not None:
            product.thong_so_ky_thuat = data.thong_so_ky_thuat
            updated = True
        if data.trang_thai is not None:
            product.trang_thai = data.trang_thai
            updated = True

        if not updated:
            logger.info("Không có trường nào được cập nhật")
            return SanPhamResponse.model_validate(product)

        db.session.commit()
        logger.info(f"Cập nhật sản phẩm thành công | ID: {san_pham_id}")
        return SanPhamResponse.model_validate(product)

    @staticmethod
    def delete_san_pham(san_pham_id: int):
        logger.info(f"DELETE /san-pham/{san_pham_id} | Xóa sản phẩm")
        product = SanPham.query.options(
            selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
        ).get(san_pham_id)

        if not product:
            logger.warning(f"Không tìm thấy sản phẩm ID: {san_pham_id}")
            raise ProductNotFound()

        public_ids = [
            img.public_id for variant in product.cac_bien_the
            for img in variant.hinh_anhs
            if img.public_id and img.public_id.strip()
        ]
        logger.debug(f"Tìm thấy {len(public_ids)} ảnh cần xóa trên Cloudinary")

        db.session.delete(product)
        db.session.commit()
        logger.info(f"Xóa sản phẩm thành công khỏi DB | ID: {san_pham_id}")

        for public_id in public_ids:
            try:
                CloudinaryService.delete_image_task.delay(public_id)
                logger.info(f"Gửi task xóa ảnh Cloudinary: {public_id}")
            except Exception as e:
                logger.error(f"Lỗi gửi task xóa ảnh {public_id}: {e}")

        return {"message": "Sản phẩm đã xóa thành công. Ảnh đang được xóa trên Cloudinary..."}

    @staticmethod
    def create_bien_the(san_pham_id: int, data: BienTheSanPhamCreate) -> BienTheSanPham:
        logger.info(f"POST /san-pham/{san_pham_id}/bien-the | Tạo biến thể")
        logger.debug(f"Input: {data.model_dump()}")

        san_pham = SanPham.query.get(san_pham_id)
        if not san_pham:
            logger.warning(f"Sản phẩm cha không tồn tại: {san_pham_id}")
            raise ProductNotFound()

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
        logger.debug(f"Tạo biến thể thành công | ID: {new_variant.id}")

        hinh_anhs = data.hinh_anhs or []
        if hinh_anhs:
            has_main = any(img.la_anh_dai_dien for img in hinh_anhs)
            for idx, img_data in enumerate(hinh_anhs):
                is_main = img_data.la_anh_dai_dien or (not has_main and idx == 0)
                img = HinhAnhSanPham(
                    bien_the_id=new_variant.id,
                    url=img_data.url,
                    public_id=img_data.public_id,
                    alt_text=img_data.alt_text,
                    la_anh_dai_dien=is_main
                )
                db.session.add(img)
            logger.debug(f"Thêm {len(hinh_anhs)} ảnh cho biến thể")

        db.session.commit()
        logger.info(f"Tạo biến thể thành công | ID: {new_variant.id}")
        return new_variant

    @staticmethod
    def update_bien_the(san_pham_id: int, bien_the_id: int, body: BienTheSanPhamUpdate):
        logger.info(f"PUT /san-pham/{san_pham_id}/bien-the/{bien_the_id} | Cập nhật biến thể")
        logger.debug(f"Input: {body.model_dump()}")

        variant = BienTheSanPham.query.filter_by(
            id=bien_the_id, san_pham_id=san_pham_id
        ).options(selectinload(BienTheSanPham.hinh_anhs)).first()

        if not variant:
            logger.warning(f"Không tìm thấy biến thể | san_pham_id={san_pham_id}, bien_the_id={bien_the_id}")
            raise NotFound("Biến thể không tồn tại")

        updated_fields = []
        if body.gia_ban is not None:
            variant.gia_ban = body.gia_ban
            updated_fields.append("gia_ban")
        if body.so_luong_ton is not None:
            variant.so_luong_ton = body.so_luong_ton
            updated_fields.append("so_luong_ton")
        if body.ten_bien_the is not None:
            variant.ten_bien_the = body.ten_bien_the
            updated_fields.append("ten_bien_the")

        logger.debug(f"Cập nhật {len(updated_fields)} trường: {updated_fields}")

        # === XÓA ẢNH ===
        public_ids_to_delete = []
        deleted_hinh_anh_ids = body.deleted_hinh_anh_ids or []
        for img_id in deleted_hinh_anh_ids:
            img = next((i for i in variant.hinh_anhs if i.id == img_id), None)
            if img:
                if img.public_id and img.public_id.strip():
                    public_ids_to_delete.append(img.public_id)
                db.session.delete(img)
                logger.info(f"Xóa ảnh ID={img.id} khỏi DB (public_id: {img.public_id})")

        # === THÊM ẢNH MỚI ===
        new_hinh_anhs_models = body.new_hinh_anhs or []

        # Kiểm tra ảnh đại diện còn lại
        remaining_main = any(img.la_anh_dai_dien for img in variant.hinh_anhs if img.id not in deleted_hinh_anh_ids)

        if new_hinh_anhs_models:
            new_main_count = sum(1 for img in new_hinh_anhs_models if img.la_anh_dai_dien)
            has_new_main = new_main_count > 0

            # Nếu có nhiều ảnh đại diện mới → chỉ giữ cái đầu
            if new_main_count > 1:
                for i, img in enumerate(new_hinh_anhs_models):
                    if i > 0 and img.la_anh_dai_dien:
                        img.la_anh_dai_dien = False

            # Nếu ảnh cũ có đại diện + ảnh mới có đại diện → bỏ ảnh cũ
            if remaining_main and has_new_main:
                for img in variant.hinh_anhs:
                    if img.id not in deleted_hinh_anh_ids:
                        img.la_anh_dai_dien = False
                        db.session.add(img)

            # Nếu không có ảnh đại diện nào → tự động chọn ảnh đầu tiên mới
            if not (remaining_main or has_new_main) and new_hinh_anhs_models:
                new_hinh_anhs_models[0].la_anh_dai_dien = True

            # Thêm ảnh mới
            for img_model in new_hinh_anhs_models:
                new_img = HinhAnhSanPham(
                    bien_the_id=variant.id,
                    url=img_model.url,
                    public_id=img_model.public_id,
                    alt_text=img_model.alt_text,
                    la_anh_dai_dien=img_model.la_anh_dai_dien
                )
                db.session.add(new_img)
            logger.debug(f"Thêm {len(new_hinh_anhs_models)} ảnh mới")

        # === COMMIT ===
        try:
            db.session.commit()
            logger.info(f"Cập nhật biến thể thành công | ID: {variant.id}")
        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"IntegrityError khi cập nhật biến thể: {e}", exc_info=True)
            raise BadRequest("Không thể thêm ảnh: đã có ảnh đại diện")

        # === GỬI TASK XÓA ẢNH CLOUDINARY ===
        for public_id in public_ids_to_delete:
            try:
                CloudinaryService.delete_image_task.delay(public_id)
                logger.info(f"Gửi task xóa Cloudinary: {public_id}")
            except Exception as e:
                logger.error(f"Lỗi gửi task xóa ảnh {public_id}: {e}")

        return variant

    @staticmethod
    def delete_bien_the(san_pham_id: int, bien_the_id: int):
        logger.info(f"DELETE /san-pham/{san_pham_id}/bien-the/{bien_the_id} | Xóa biến thể")
        variant = BienTheSanPham.query.filter_by(
            id=bien_the_id, san_pham_id=san_pham_id
        ).options(selectinload(BienTheSanPham.hinh_anhs)).first()

        if not variant:
            logger.warning(f"Không tìm thấy biến thể | san_pham_id={san_pham_id}, bien_the_id={bien_the_id}")
            raise NotFound("Biến thể không tồn tại")

        public_ids = [img.public_id for img in variant.hinh_anhs if img.public_id and img.public_id.strip()]
        logger.debug(f"Tìm thấy {len(public_ids)} ảnh cần xóa trên Cloudinary")

        db.session.delete(variant)
        db.session.commit()
        logger.info(f"Xóa biến thể thành công khỏi DB | ID: {bien_the_id}")

        for public_id in public_ids:
            try:
                CloudinaryService.delete_image_task.delay(public_id)
                logger.info(f"Gửi task xóa ảnh Cloudinary: {public_id}")
            except Exception as e:
                logger.error(f"Lỗi gửi task xóa ảnh {public_id}: {e}")

        return {"message": "Xóa biến thể thành công"}