# app/services/sanpham_service.py
from http.client import HTTPException
from sqlalchemy.orm import joinedload, selectinload
from ..extensions import db
from ..models.sanpham import SanPham, BienTheSanPham, HinhAnhSanPham, DanhMuc, ThuongHieu
from ..models.giohang_dathang import ChiTietDonHang, ChiTietGioHang
from ..schemas.sanpham import (
    SanPhamCreate, SanPhamUpdate, SanPhamResponse,
    BienTheSanPhamCreate, BienTheSanPhamUpdate, SanPhamListResponse,
    HinhAnhCreate, HinhAnhUpdate
)
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import NotFound, BadRequest
from sqlalchemy import func, case, null, text, and_
from ..utils.taoMa import generate_ma_san_pham
from .cloudinary_service import CloudinaryService
import logging
from datetime import datetime

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
        sort_by_price=None,
        sort_by_name=None,
        thuong_hieu_ids=None,
        danh_muc_ids=None
    ):
        logger.info(
            f"GET /san-pham | page={page}, per_page={per_page}, search='{search}', "
            f"min_price={min_price}, max_price={max_price}, sort_by='{sort_by_price} & {sort_by_name}', "
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

        need_price_join = (min_price is not None or max_price is not None or sort_by_price in ['price_asc', 'price_desc'])
        if need_price_join:
            logger.debug("JOIN subquery giá hiệu quả")
            query = query.join(price_subquery, price_subquery.c.san_pham_id == SanPham.id)

        if min_price is not None:
            logger.debug(f"Lọc giá >= {min_price}")
            query = query.filter(price_subquery.c.min_effective_price >= min_price)
        if max_price is not None:
            logger.debug(f"Lọc giá <= {max_price}")
            query = query.filter(price_subquery.c.min_effective_price <= max_price)

        if sort_by_price == 'price_asc':
            logger.debug("Sắp xếp giá tăng dần")
            query = query.order_by(price_subquery.c.min_effective_price.asc())
        if sort_by_price == 'price_desc':
            logger.debug("Sắp xếp giá giảm dần")
            query = query.order_by(price_subquery.c.min_effective_price.desc())
        if sort_by_name == 'name_asc':
            logger.debug("Sắp xếp tên A→Z")
            query = query.order_by(SanPham.ten_san_pham.asc())
        if sort_by_name == 'name_desc':
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
        logger.info(f"GET /san-pham/{san_pham_id}")
        san_pham = SanPham.query.options(
            joinedload(SanPham.danh_muc),
            joinedload(SanPham.thuong_hieu),
            selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
        ).get(san_pham_id)
        if not san_pham:
            logger.warning(f"Không tìm thấy sản phẩm ID: {san_pham_id}")
            raise ProductNotFound()
        return san_pham

    @staticmethod
    def create_san_pham(data: SanPhamCreate):
        """
        Luồng thêm sản phẩm FIXED:
        1. Kiểm tra danh_muc_id và thuong_hieu_id tồn tại.
        2. Generate ma_san_pham.
        3. Thêm sản phẩm vào DB.
        4. Thêm biến thể và ảnh (nếu có) trong cùng transaction.
        """
        logger.info("Tạo sản phẩm mới")
        
        try:
            # Bước 1: Kiểm tra danh mục và thương hiệu
            danh_muc = db.session.query(DanhMuc).get(data.danh_muc_id)
            if not danh_muc:
                raise NotFound("Danh mục không tồn tại")
            thuong_hieu = db.session.query(ThuongHieu).get(data.thuong_hieu_id)
            if not thuong_hieu:
                raise NotFound("Thương hiệu không tồn tại")
            
            # Bước 2: Generate mã
            ma_san_pham = generate_ma_san_pham(danh_muc.ma_danh_muc[:5], thuong_hieu.ma_thuong_hieu[:5])
            
            # Bước 3: Tạo sản phẩm
            new_san_pham = SanPham(
                ma_san_pham=ma_san_pham,
                danh_muc_id=data.danh_muc_id,
                thuong_hieu_id=data.thuong_hieu_id,
                ten_san_pham=data.ten_san_pham,
                mo_ta=data.mo_ta,
                thong_so_ky_thuat=data.thong_so_ky_thuat,
                trang_thai=data.trang_thai,
                ngay_tao=datetime.utcnow(),
                ngay_cap_nhat=datetime.utcnow()
            )
            db.session.add(new_san_pham)
            db.session.flush()  # Lấy ID sản phẩm
            
            # Bước 4: Thêm biến thể và ảnh
            if data.bien_the_san_phams:
                for bt_data in data.bien_the_san_phams:
                    new_variant = BienTheSanPham(
                        san_pham_id=new_san_pham.id,
                        ten_bien_the=bt_data.ten_bien_the,
                        trang_thai_kich_hoat=bt_data.trang_thai_kich_hoat,
                        gia_ban=bt_data.gia_ban,
                        gia_khuyen_mai=bt_data.gia_khuyen_mai,
                        ngay_bat_dau_khuyen_mai=bt_data.ngay_bat_dau_khuyen_mai,
                        ngay_ket_thuc_khuyen_mai=bt_data.ngay_ket_thuc_khuyen_mai,
                        so_luong_ton=bt_data.so_luong_ton
                    )
                    db.session.add(new_variant)
                    db.session.flush()  # Lấy ID biến thể
                    
                    # Thêm ảnh nếu có
                    if bt_data.hinh_anhs:
                        for img_data in bt_data.hinh_anhs:
                            new_image = HinhAnhSanPham(
                                bien_the_id=new_variant.id,
                                url=img_data.url,
                                public_id=img_data.public_id,
                                alt_text=img_data.alt_text,
                                la_anh_dai_dien=img_data.la_anh_dai_dien
                            )
                            db.session.add(new_image)
            
            db.session.commit()
            logger.info(f"Tạo sản phẩm thành công: {new_san_pham.id}")
            return new_san_pham
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi tạo sản phẩm: {e}", exc_info=True)
            raise BadRequest(f"Lỗi tạo sản phẩm: {str(e)}")

    @staticmethod
    def update_san_pham(san_pham_id: int, data: SanPhamUpdate):
        """
        Luồng sửa sản phẩm:
        1. Kiểm tra sản phẩm tồn tại.
        2. Update fields cơ bản. Nếu có cac_bien_the, loop và gọi update_bien_the cho từng cái.
        """
        logger.info(f"PUT /san-pham/{san_pham_id}")
        san_pham = SanPhamService.get_san_pham_by_id(san_pham_id)
        
        update_data = data.model_dump(exclude_unset=True)
        
        if not update_data:
            logger.info("Không có trường nào được cập nhật cho sản phẩm")
            return san_pham

        try:
            if 'danh_muc_id' in update_data:
                san_pham.danh_muc_id = update_data['danh_muc_id']
            if 'thuong_hieu_id' in update_data:
                san_pham.thuong_hieu_id = update_data['thuong_hieu_id']
            if 'ten_san_pham' in update_data:
                san_pham.ten_san_pham = update_data['ten_san_pham']
            if 'mo_ta' in update_data:
                san_pham.mo_ta = update_data['mo_ta']
            if 'thong_so_ky_thuat' in update_data:
                san_pham.thong_so_ky_thuat = update_data['thong_so_ky_thuat']
            if 'trang_thai' in update_data:
                san_pham.trang_thai = update_data['trang_thai']
            san_pham.ngay_cap_nhat = datetime.utcnow()

            db.session.add(san_pham)
            db.session.flush()  # Kiểm tra UNIQUE nếu cần

            # Bước 2: Update biến thể nếu có
            if data.cac_bien_the:
                for bt_update in data.cac_bien_the:
                    SanPhamService.update_bien_the(san_pham_id, bt_update.id, bt_update)  # Giả sử bt_update có id

            logger.info(f"Cập nhật sản phẩm thành công (chưa commit) | ID: {san_pham_id}")
            return san_pham
        except IntegrityError as e:
            logger.error(f"IntegrityError khi cập nhật sản phẩm: {e}", exc_info=True)
            raise BadRequest("Dữ liệu vi phạm ràng buộc.")
        except Exception as e:
            logger.error(f"Lỗi không xác định khi cập nhật sản phẩm: {e}", exc_info=True)
            raise BadRequest(f"Lỗi cập nhật sản phẩm: {str(e)}")

    @staticmethod
    def delete_san_pham(san_pham_id: int):
        """
        Luồng xóa sản phẩm:
        1. Kiểm tra sản phẩm tồn tại.
        2. Xóa tất cả biến thể (gọi delete_bien_the).
        3. Xóa sản phẩm.
        """
        logger.info(f"DELETE /san-pham/{san_pham_id}")
        san_pham = SanPhamService.get_san_pham_by_id(san_pham_id)
        
        # Bước 2: Xóa biến thể
        for variant in san_pham.cac_bien_the:
            SanPhamService.delete_bien_the(san_pham_id, variant.id)
        
        # Bước 3: Xóa sản phẩm
        db.session.delete(san_pham)
        logger.info(f"Xóa sản phẩm thành công (chưa commit) | ID: {san_pham_id}")
        return {"message": "Xóa sản phẩm thành công"}

    @staticmethod
    def add_hinh_anh_to_bien_the(bien_the_id: int, hinh_anh_data: HinhAnhCreate):
        """
        Luồng thêm ảnh biến thể:
        1. Kiểm tra biến thể tồn tại.
        2. Nếu ảnh mới là đại diện (la_anh_dai_dien=True), set tất cả ảnh cũ của biến thể thành False.
        3. Thêm ảnh mới vào DB.
        """
        logger.info(f"Thêm ảnh cho biến thể ID: {bien_the_id}")
        
        # Bước 1: Kiểm tra biến thể tồn tại
        variant = db.session.query(BienTheSanPham).get(bien_the_id)
        if not variant:
            logger.warning(f"Biến thể không tồn tại: {bien_the_id}")
            raise NotFound("Biến thể không tồn tại")
        
        # Bước 2: Nếu ảnh mới là đại diện, reset tất cả ảnh cũ thành False
        if hinh_anh_data.la_anh_dai_dien:
            db.session.query(HinhAnhSanPham).filter(
                HinhAnhSanPham.bien_the_id == bien_the_id
            ).update({HinhAnhSanPham.la_anh_dai_dien: False}, synchronize_session=False)
            logger.debug("Reset tất cả ảnh đại diện cũ thành False")
        
        # Bước 3: Thêm ảnh mới
        new_hinh_anh = HinhAnhSanPham(
            bien_the_id=bien_the_id,
            url=hinh_anh_data.url,
            public_id=hinh_anh_data.public_id,
            alt_text=hinh_anh_data.alt_text,
            la_anh_dai_dien=hinh_anh_data.la_anh_dai_dien
        )
        db.session.add(new_hinh_anh)
        
        # Commit ở route, nhưng flush để kiểm tra
        db.session.flush()
        logger.info(f"Thêm ảnh thành công cho biến thể {bien_the_id}")
        return new_hinh_anh

    @staticmethod
    def update_hinh_anh(hinh_anh_id: int, update_data: HinhAnhUpdate):
        """
        Luồng sửa ảnh biến thể (chủ yếu set đại diện):
        1. Kiểm tra ảnh tồn tại.
        2. Nếu set la_anh_dai_dien=True, reset tất cả ảnh khác của biến thể thành False.
        3. Update ảnh.
        """
        logger.info(f"Cập nhật ảnh ID: {hinh_anh_id}")
        
        # Bước 1: Kiểm tra ảnh tồn tại
        hinh_anh = db.session.query(HinhAnhSanPham).get(hinh_anh_id)
        if not hinh_anh:
            logger.warning(f"Ảnh không tồn tại: {hinh_anh_id}")
            raise NotFound("Ảnh không tồn tại")
        
        # Lấy dữ liệu update (exclude unset)
        data = update_data.model_dump(exclude_unset=True)
        if not data:
            return hinh_anh  # Không thay đổi
        
        # Bước 2: Nếu set đại diện=True, reset ảnh khác
        if 'la_anh_dai_dien' in data and data['la_anh_dai_dien']:
            db.session.query(HinhAnhSanPham).filter(
                and_(HinhAnhSanPham.bien_the_id == hinh_anh.bien_the_id, HinhAnhSanPham.id != hinh_anh_id)
            ).update({HinhAnhSanPham.la_anh_dai_dien: False}, synchronize_session=False)
            logger.debug("Reset ảnh đại diện khác thành False")
        
        # Bước 3: Update fields
        for key, value in data.items():
            setattr(hinh_anh, key, value)
        
        db.session.add(hinh_anh)
        db.session.flush()
        logger.info(f"Cập nhật ảnh thành công: {hinh_anh_id}")
        return hinh_anh

    @staticmethod
    def delete_hinh_anh(hinh_anh_id: int, bienthexoa: bool = False):
        """
        Luồng xóa ảnh biến thể:
        1. Kiểm tra ảnh tồn tại.
        2. Nếu là ảnh đại diện, báo lỗi (không cho xóa).
        3. Xóa ảnh từ DB và gửi task xóa Cloudinary.
        """
        logger.info(f"Xóa ảnh ID: {hinh_anh_id}")
        
        # Bước 1: Kiểm tra ảnh tồn tại
        hinh_anh = db.session.query(HinhAnhSanPham).get(hinh_anh_id)
        if not hinh_anh:
            logger.warning(f"Ảnh không tồn tại: {hinh_anh_id}")
            raise NotFound("Ảnh không tồn tại")
        

        # Bước 2: Không cho xóa ảnh đại diện
        if hinh_anh.la_anh_dai_dien and bienthexoa:
            logger.warning(f"Không thể xóa ảnh đại diện: {hinh_anh_id}")
            raise BadRequest("Không thể xóa ảnh đại diện")
        
        # Bước 3: Xóa từ DB
        public_id = hinh_anh.public_id
        db.session.delete(hinh_anh)
        db.session.flush()
        logger.info(f"Xóa ảnh DB thành công: {hinh_anh_id}")
        
        # Gửi task xóa Cloudinary (sau commit ở route)
        if public_id:
            CloudinaryService.delete_image_task.delay(public_id)
            logger.info(f"Gửi task xóa Cloudinary: {public_id}")
        
        return {"message": "Xóa ảnh thành công"}

    @staticmethod
    def create_bien_the(san_pham_id: int, data: BienTheSanPhamCreate):
        """
        Luồng thêm biến thể:
        1. Kiểm tra sản phẩm tồn tại.
        2. Thêm biến thể vào DB, sau đó thêm ảnh (ảnh đầu tiên là đại diện nếu không chỉ định).
        """
        logger.info(f"Thêm biến thể cho sản phẩm ID: {san_pham_id}")
        
        # Bước 1: Kiểm tra sản phẩm tồn tại
        san_pham = db.session.query(SanPham).get(san_pham_id)
        if not san_pham:
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
        db.session.flush()  # Flush để lấy ID
        
        # Bước 2: Thêm ảnh (sử dụng method add_hinh_anh_to_bien_the)
        if data.hinh_anhs:
            # Nếu không có ảnh đại diện chỉ định, set ảnh đầu tiên là đại diện
            has_main = any(img.la_anh_dai_dien for img in data.hinh_anhs)
            if not has_main:
                data.hinh_anhs[0].la_anh_dai_dien = True
            for img in data.hinh_anhs:
                SanPhamService.add_hinh_anh_to_bien_the(new_variant.id, img)
        
        logger.info(f"Thêm biến thể thành công: {new_variant.id}")
        return new_variant

    @staticmethod
    def update_bien_the(san_pham_id: int, bien_the_id: int, data: BienTheSanPhamUpdate):
        """
        Luồng sửa biến thể FIXED:
        1. Kiểm tra biến thể tồn tại và thuộc sản phẩm.
        2. Update fields cơ bản.
        3. Xử lý ảnh: giữ ảnh cũ, thêm ảnh mới, xóa ảnh được đánh dấu.
        """
        logger.info(f"PUT /san-pham/{san_pham_id}/bien-the/{bien_the_id}")
        
        # 1. Kiểm tra biến thể
        variant = db.session.query(BienTheSanPham).options(
            selectinload(BienTheSanPham.hinh_anhs)
        ).filter(
            BienTheSanPham.id == bien_the_id,
            BienTheSanPham.san_pham_id == san_pham_id
        ).first()

        if not variant:
            logger.warning(f"Không tìm thấy biến thể | san_pham_id={san_pham_id}, bien_the_id={bien_the_id}")
            raise NotFound("Biến thể không tồn tại")

        try:
            # 2. Update fields cơ bản
            update_data = data.model_dump(exclude_unset=True, exclude={'hinh_anhs'})
            for key, value in update_data.items():
                if hasattr(variant, key):
                    setattr(variant, key, value)

            # 3. Xử lý ảnh - FIXED: Xử lý đúng cách
            if hasattr(data, 'hinh_anhs') and data.hinh_anhs is not None:
                current_images = {img.id: img for img in variant.hinh_anhs}
                new_images = []
                images_to_delete = []
                
                # Phân loại ảnh
                for img_data in data.hinh_anhs:
                    # Ảnh mới (không có id)
                    if not getattr(img_data, 'id', None):
                        new_images.append(img_data)
                    # Ảnh cũ tồn tại
                    elif img_data.id in current_images:
                        # Update ảnh cũ nếu có thay đổi
                        existing_img = current_images[img_data.id]
                        if hasattr(img_data, 'la_anh_dai_dien'):
                            existing_img.la_anh_dai_dien = img_data.la_anh_dai_dien
                        if hasattr(img_data, 'alt_text'):
                            existing_img.alt_text = img_data.alt_text
                
                # Thêm ảnh mới
                for img_data in new_images:
                    new_img = HinhAnhSanPham(
                        bien_the_id=bien_the_id,
                        url=img_data.url,
                        public_id=img_data.public_id,
                        alt_text=getattr(img_data, 'alt_text', ''),
                        la_anh_dai_dien=getattr(img_data, 'la_anh_dai_dien', False)
                    )
                    db.session.add(new_img)
                
                # Reset ảnh đại diện nếu cần
                main_image_set = any(img.la_anh_dai_dien for img in data.hinh_anhs if getattr(img, 'la_anh_dai_dien', False))
                if not main_image_set and new_images:
                    # Set ảnh đầu tiên làm đại diện nếu không có ảnh nào được set
                    first_img = db.session.query(HinhAnhSanPham).filter(
                        HinhAnhSanPham.bien_the_id == bien_the_id
                    ).first()
                    if first_img:
                        first_img.la_anh_dai_dien = True

            db.session.add(variant)
            db.session.commit()
            logger.info(f"Cập nhật biến thể thành công | ID: {bien_the_id}")
            
            # Refresh để lấy dữ liệu mới nhất
            db.session.refresh(variant)
            return variant

        except IntegrityError as e:
            db.session.rollback()
            logger.error(f"IntegrityError khi cập nhật biến thể: {e}", exc_info=True)
            raise BadRequest("Không thể cập nhật biến thể")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi không xác định khi cập nhật biến thể: {e}", exc_info=True)
            raise BadRequest(f"Lỗi cập nhật biến thể: {str(e)}")

    @staticmethod
    def delete_bien_the(san_pham_id: int, bien_the_id: int):
        """
        Luồng xóa biến thể:
        1. Kiểm tra biến thể tồn tại và thuộc sản phẩm.
        2. Xóa tất cả ảnh (gọi delete_hinh_anh cho từng cái, nhưng skip kiểm tra đại diện vì xóa toàn bộ).
        3. Xóa biến thể.
        """
        logger.info(f"DELETE /san-pham/{san_pham_id}/bien-the/{bien_the_id} | Xóa biến thể")
        session = db.session

        # 1. Kiểm tra biến thể tồn tại và thuộc sản phẩm
        bien_the = session.query(BienTheSanPham).filter(
            BienTheSanPham.id == bien_the_id,
            BienTheSanPham.san_pham_id == san_pham_id
        ).first()

        if not bien_the:
            logger.warning(f"Không tìm thấy biến thể | san_pham_id={san_pham_id}, bien_the_id={bien_the_id}")
            raise NotFound("Biến thể không tồn tại")

        # 2. Kiểm tra có trong đơn hàng không (không được xóa nếu đã có trong đơn hàng)
        don_hang_exists = session.query(ChiTietDonHang).filter(
            ChiTietDonHang.bien_the_san_pham_id == bien_the_id
        ).first()

        if don_hang_exists:
            logger.warning(f"Không thể xóa biến thể đã có trong đơn hàng | bien_the_id={bien_the_id}")
            raise BadRequest("Không thể xóa biến thể đã có trong đơn hàng")

        # 4. Lấy danh sách ảnh để xóa (DB + Cloudinary)
        hinh_anhs = session.query(HinhAnhSanPham).filter(
            HinhAnhSanPham.bien_the_id == bien_the_id
        ).all()

        public_ids_to_delete = []
        for ha in hinh_anhs:
            if ha.public_id and ha.public_id.strip():
                public_ids_to_delete.append(ha.public_id)
            try:
                session.delete(ha)
            except Exception as e:
                logger.error(f"Lỗi khi xóa ảnh trong DB ID={getattr(ha,'id',None)}: {e}", exc_info=True)
                session.rollback()
                raise BadRequest("Lỗi khi xóa ảnh trong DB")

        # 5. Xóa biến thể
        try:
            session.delete(bien_the)
            session.commit()
            logger.info(f"Xóa biến thể thành công | ID: {bien_the_id}")
        except Exception as e:
            session.rollback()
            logger.error(f"Lỗi khi xóa biến thể khỏi DB: {e}", exc_info=True)
            raise BadRequest("Lỗi khi xóa biến thể")

        # 6. Gửi task xóa ảnh lên Cloudinary (sau commit DB)
        for public_id in public_ids_to_delete:
            try:
                CloudinaryService.delete_image_task.delay(public_id)
                logger.info(f"Gửi task xóa ảnh Cloudinary: {public_id}")
            except Exception as e:
                logger.error(f"Lỗi khi gửi task xóa ảnh Cloudinary cho public_id={public_id}: {e}")

        return {"message": "Xóa biến thể thành công"}