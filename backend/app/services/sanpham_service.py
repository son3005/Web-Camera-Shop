# app/services/sanpham_service.py
import logging
from sqlalchemy.orm import joinedload, selectinload, aliased
from sqlalchemy import or_, and_, func
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import NotFound, BadRequest
from datetime import datetime

from ..models.extras import DanhGia

from ..extensions import db
from ..models.sanpham import SanPham, BienTheSanPham, HinhAnhSanPham, DanhMuc, ThuongHieu, CapDo
from ..models.giohang_dathang import ChiTietDonHang
from ..schemas.sanpham import (
    SanPhamCreate, SanPhamUpdate, SanPhamResponse, SanPhamLienQuanResponse,
    BienTheSanPhamCreate, BienTheSanPhamUpdate,
)
from ..utils.taoMa import generate_ma_san_pham
from .cloudinary_service import delete_image_task
from sqlalchemy import desc
from ..schemas.sanpham import BienTheBasicListResponse

logger = logging.getLogger(__name__)

class ProductNotFound(NotFound):
    def __init__(self, message="Sản phẩm không tồn tại"):
        super().__init__(description=message)

class SanPhamService:

    @staticmethod
    def remove_accents(input_str):
        """Chuyển chuỗi tiếng Việt có dấu thành không dấu - IMPROVED VERSION"""
        if not input_str:
            return ""
        
        # Mapping chi tiết các ký tự tiếng Việt
        vietnamese_map = {
            'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
            'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
            'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
            'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
            'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
            'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
            'đ': 'd',
            'À': 'A', 'Á': 'A', 'Ả': 'A', 'Ã': 'A', 'Ạ': 'A',
            'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ẳ': 'A', 'Ẵ': 'A', 'Ặ': 'A',
            'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ậ': 'A',
            'È': 'E', 'É': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ẹ': 'E',
            'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ể': 'E', 'Ễ': 'E', 'Ệ': 'E',
            'Ì': 'I', 'Í': 'I', 'Ỉ': 'I', 'Ĩ': 'I', 'Ị': 'I',
            'Ò': 'O', 'Ó': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ọ': 'O',
            'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ộ': 'O',
            'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ở': 'O', 'Ỡ': 'O', 'Ợ': 'O',
            'Ù': 'U', 'Ú': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ụ': 'U',
            'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ử': 'U', 'Ữ': 'U', 'Ự': 'U',
            'Ỳ': 'Y', 'Ý': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y', 'Ỵ': 'Y',
            'Đ': 'D'
        }
        
        result = []
        for char in input_str:
            result.append(vietnamese_map.get(char, char))
        
        return ''.join(result)

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
        danh_muc_ids=None,
        cap_do_ids=None
    ):
        """
        Lấy danh sách sản phẩm với tìm kiếm cải tiến - FIXED SEARCH
        """
        query = SanPham.query.options(
            joinedload(SanPham.danh_muc),
            joinedload(SanPham.thuong_hieu),
            joinedload(SanPham.cap_do),
            selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
        )

        # Lọc theo danh mục, thương hiệu, cấp độ
        if danh_muc_ids:
            query = query.filter(SanPham.danh_muc_id.in_(danh_muc_ids))
        if thuong_hieu_ids:
            query = query.filter(SanPham.thuong_hieu_id.in_(thuong_hieu_ids))
        if cap_do_ids:
            query = query.filter(SanPham.cap_do_id.in_(cap_do_ids))

        # CẢI TIẾN TÌM KIẾM - FIXED: Tìm kiếm tiếng Việt và từ ngắn
        if search:
            logger.debug(f"Tìm kiếm cải tiến: '{search}'")
            
            # Chuẩn hóa từ khóa tìm kiếm
            search_normalized = SanPhamService.remove_accents(search).lower().strip()
            
            # Cho phép tìm kiếm từ 1 ký tự trở lên
            if len(search_normalized) >= 1:
                search_terms = search_normalized.split()
                
                search_conditions = []
                
                for term in search_terms:
                    if len(term) >= 1:  # Cho phép tìm kiếm từ 1 ký tự
                        term_pattern = f"%{term}%"
                        
                        # Tìm kiếm không dấu trong các trường
                        like_condition = or_(
                            # Tìm trong tên sản phẩm (sử dụng hàm remove_accents cho cả hai bên)
                            func.lower(func.replace(SanPham.ten_san_pham, ' ', '')).ilike(f"%{term}%"),
                            # Tìm trong mô tả
                            func.lower(func.replace(SanPham.mo_ta, ' ', '')).ilike(f"%{term}%"),
                            # Tìm trong tên thương hiệu
                            func.lower(func.replace(ThuongHieu.ten_thuong_hieu, ' ', '')).ilike(f"%{term}%"),
                            # Tìm trong tên danh mục
                            func.lower(func.replace(DanhMuc.ten_danh_muc, ' ', '')).ilike(f"%{term}%"),
                            # Tìm trong mã sản phẩm
                            SanPham.ma_san_pham.ilike(term_pattern)
                        )
                        
                        search_conditions.append(like_condition)
                
                if search_conditions:
                    # Kết hợp tất cả điều kiện tìm kiếm với AND (tất cả từ phải khớp)
                    final_search_condition = and_(*search_conditions)
                    query = query.join(ThuongHieu).join(DanhMuc).filter(final_search_condition)
                    logger.debug(f"Áp dụng điều kiện tìm kiếm với {len(search_terms)} từ")
            else:
                logger.debug("Từ khóa tìm kiếm quá ngắn, bỏ qua tìm kiếm")

        # Xử lý lọc giá
        effective_price = BienTheSanPham.gia_ban

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

        # Sắp xếp
        if sort_by_price == 'price_asc':
            logger.debug("Sắp xếp giá tăng dần")
            query = query.order_by(price_subquery.c.min_effective_price.asc())
        elif sort_by_price == 'price_desc':
            logger.debug("Sắp xếp giá giảm dần")
            query = query.order_by(price_subquery.c.min_effective_price.desc())
        else:
            # Mặc định sắp xếp theo ngày tạo mới nhất
            query = query.order_by(SanPham.ngay_tao.desc())
            
        if sort_by_name == 'name_asc':
            logger.debug("Sắp xếp tên A→Z")
            query = query.order_by(SanPham.ten_san_pham.asc())
        elif sort_by_name == 'name_desc':
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
        """
        Lấy thông tin chi tiết của một sản phẩm dựa trên ID.
        """
        logger.info(f"GET /san-pham/{san_pham_id}")
        san_pham = SanPham.query.options(
            joinedload(SanPham.danh_muc),
            joinedload(SanPham.thuong_hieu),
            joinedload(SanPham.cap_do),
            selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
        ).get(san_pham_id)
        if not san_pham:
            logger.warning(f"Không tìm thấy sản phẩm ID: {san_pham_id}")
            raise ProductNotFound()
        return san_pham

    @staticmethod
    def create_san_pham(data: SanPhamCreate):
        """
        Tạo mới một sản phẩm cùng với các biến thể và hình ảnh liên quan.
        """
        logger.info("Tạo sản phẩm mới")
        
        try:
            # Bước 1: Kiểm tra danh mục, thương hiệu và cấp độ
            danh_muc = db.session.query(DanhMuc).get(data.danh_muc_id)
            if not danh_muc:
                raise NotFound("Danh mục không tồn tại")
            thuong_hieu = db.session.query(ThuongHieu).get(data.thuong_hieu_id)
            if not thuong_hieu:
                raise NotFound("Thương hiệu không tồn tại")
            cap_do = db.session.query(CapDo).get(data.cap_do_id)
            if not cap_do:  # FIXED: đổi từ thuong_hieu thành cap_do
                raise NotFound("Cấp độ không tồn tại")
            
            # Bước 2: Generate mã
            ma_san_pham = generate_ma_san_pham(danh_muc.ma_danh_muc[:5], thuong_hieu.ma_thuong_hieu[:5])
            
            # Bước 3: Tạo sản phẩm
            new_san_pham = SanPham(
                ma_san_pham=ma_san_pham,
                danh_muc_id=data.danh_muc_id,
                thuong_hieu_id=data.thuong_hieu_id,
                cap_do_id=data.cap_do_id,
                ten_san_pham=data.ten_san_pham,
                mo_ta=data.mo_ta,
                thong_so_ky_thuat=data.thong_so_ky_thuat,
                ngay_tao=datetime.utcnow(),
                ngay_cap_nhat=datetime.utcnow()
            )
            db.session.add(new_san_pham)
            db.session.flush()
            
            # Bước 4: Thêm biến thể và ảnh - SỬA: đổi tên trường thành cac_bien_the
            if data.cac_bien_the:  # FIXED: đổi từ bien_the_san_phams
                for bt_data in data.cac_bien_the:
                    new_variant = BienTheSanPham(
                        san_pham_id=new_san_pham.id,
                        ten_bien_the=bt_data.ten_bien_the,
                        trang_thai_kich_hoat=bt_data.trang_thai_kich_hoat,
                        mau=bt_data.mau,
                        gia_ban=bt_data.gia_ban,
                    )
                    db.session.add(new_variant)
                    db.session.flush()
                    
                    # Thêm ảnh nếu có
                    if bt_data.hinh_anhs:
                        for img_data in bt_data.hinh_anhs:
                            new_image = HinhAnhSanPham(
                                bien_the_id=new_variant.id,
                                url=img_data.url,  
                                public_id=img_data.public_id,  
                                alt_text=img_data.alt_text,
                                la_anh_dai_dien=img_data.la_anh_dai_dien,
                                thu_tu=img_data.thu_tu
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
    def update_san_pham_with_variants(san_pham_id: int, data: SanPhamUpdate):
        """
        Cập nhật thông tin sản phẩm cùng với các biến thể của sản phẩm.
        """
        logger.info(f"Cập nhật sản phẩm với biến thể | ID: {san_pham_id}")
        san_pham = SanPhamService.get_san_pham_by_id(san_pham_id)
        
        # Cập nhật thông tin cơ bản của sản phẩm
        update_data = data.model_dump(exclude_unset=True, exclude={'cac_bien_the', 'bien_the_xoa_ids'})
        for key, value in update_data.items():
            if hasattr(san_pham, key):
                setattr(san_pham, key, value)
        
        # Xóa biến thể được đánh dấu
        if data.bien_the_xoa_ids:
            for bien_the_id in data.bien_the_xoa_ids:
                SanPhamService.delete_bien_the(san_pham_id, bien_the_id)
        
        # Cập nhật hoặc thêm biến thể mới
        if data.cac_bien_the:
            for bt_data in data.cac_bien_the:
                if bt_data.id:  # Biến thể cũ - cập nhật
                    SanPhamService.update_bien_the_with_images(san_pham_id, bt_data.id, bt_data)
                else:  # Biến thể mới - thêm
                    SanPhamService.create_bien_the(san_pham_id, bt_data)
        
        san_pham.ngay_cap_nhat = datetime.utcnow()
        db.session.add(san_pham)
        db.session.commit()
        
        logger.info(f"Cập nhật sản phẩm với biến thể thành công | ID: {san_pham_id}")
        return san_pham

    @staticmethod
    def delete_san_pham(san_pham_id: int):
        """
        Xóa một sản phẩm dựa trên ID sản phẩm.
        """
        logger.info(f"DELETE /san-pham/{san_pham_id}")
        
        try:
            # 1. Kiểm tra sản phẩm tồn tại
            san_pham = SanPhamService.get_san_pham_by_id(san_pham_id)
            
            # 2. Thu thập tất cả public_id của ảnh
            public_ids_to_delete = []   
            for variant in san_pham.cac_bien_the:
                for image in variant.hinh_anhs:
                    if image.public_id and image.public_id.strip():
                        public_ids_to_delete.append(image.public_id)
            
            # 3. Kiểm tra có biến thể nào trong đơn hàng không
            for variant in san_pham.cac_bien_the:
                don_hang_exists = db.session.query(ChiTietDonHang).filter(
                    ChiTietDonHang.bien_the_san_pham_id == variant.id
                ).first()
                if don_hang_exists:
                    logger.warning(f"Không thể xóa sản phẩm vì biến thể {variant.id} đã có trong đơn hàng")
                    raise BadRequest("Không thể xóa sản phẩm vì có biến thể đã được đặt hàng")

            # 4. Xóa sản phẩm (sẽ cascade xóa biến thể và ảnh)
            db.session.delete(san_pham)
            db.session.commit()
            logger.info(f"Xóa sản phẩm thành công | ID: {san_pham_id}")
            
            # 5. Trả về danh sách public_ids để route xử lý
            return public_ids_to_delete
                
        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi khi xóa sản phẩm: {e}", exc_info=True)
            raise BadRequest(f"Lỗi xóa sản phẩm: {str(e)}")

    # Các phương thức khác giữ nguyên...
    @staticmethod
    def add_hinh_anh_to_bien_the(bien_the_id: int, hinh_anh_data):
        """Thêm hình ảnh cho biến thể"""
        logger.info(f"Thêm ảnh cho biến thể ID: {bien_the_id}")
        
        variant = db.session.query(BienTheSanPham).get(bien_the_id)
        if not variant:
            logger.warning(f"Biến thể không tồn tại: {bien_the_id}")
            raise NotFound("Biến thể không tồn tại")
        
        if hinh_anh_data.la_anh_dai_dien:
            db.session.query(HinhAnhSanPham).filter(
                HinhAnhSanPham.bien_the_id == bien_the_id
            ).update({HinhAnhSanPham.la_anh_dai_dien: False}, synchronize_session=False)
            logger.debug("Reset tất cả ảnh đại diện cũ thành False")
        
        new_hinh_anh = HinhAnhSanPham(
            bien_the_id=bien_the_id,
            url=hinh_anh_data.url,
            public_id=hinh_anh_data.public_id,
            alt_text=hinh_anh_data.alt_text,
            la_anh_dai_dien=hinh_anh_data.la_anh_dai_dien,
            thu_tu=hinh_anh_data.thu_tu
        )
        db.session.add(new_hinh_anh)
        db.session.flush()
        logger.info(f"Thêm ảnh thành công cho biến thể {bien_the_id}")
        return new_hinh_anh

    @staticmethod
    def create_bien_the(san_pham_id: int, data: BienTheSanPhamCreate):
        """Tạo biến thể mới"""
        logger.info(f"Thêm biến thể cho sản phẩm ID: {san_pham_id}")
        
        san_pham = db.session.query(SanPham).get(san_pham_id)
        if not san_pham:
            raise NotFound("Sản phẩm không tồn tại")
        
        new_variant = BienTheSanPham(
            san_pham_id=san_pham_id,
            ten_bien_the=data.ten_bien_the,
            trang_thai_kich_hoat=data.trang_thai_kich_hoat,
            gia_ban=data.gia_ban,
            mau=data.mau
        )
        db.session.add(new_variant)
        db.session.flush()
        
        if data.hinh_anhs:
            has_main = any(img.la_anh_dai_dien for img in data.hinh_anhs)
            if not has_main:
                data.hinh_anhs[0].la_anh_dai_dien = True
            for img in data.hinh_anhs:
                SanPhamService.add_hinh_anh_to_bien_the(new_variant.id, img)
        
        logger.info(f"Thêm biến thể thành công: {new_variant.id}")
        return new_variant

    @staticmethod
    def update_bien_the_with_images(san_pham_id: int, bien_the_id: int, data: BienTheSanPhamUpdate):
        """Cập nhật biến thể với ảnh - ĐÃ THÊM DEBUG CHI TIẾT"""
        logger.info(f"Cập nhật biến thể với ảnh | ID: {bien_the_id}")
        
        variant = db.session.query(BienTheSanPham).options(
            selectinload(BienTheSanPham.hinh_anhs)
        ).filter(
            BienTheSanPham.id == bien_the_id,
            BienTheSanPham.san_pham_id == san_pham_id
        ).first()

        if not variant:
            raise NotFound("Biến thể không tồn tại")

        try:
            # Cập nhật thông tin cơ bản
            update_data = data.model_dump(exclude_unset=True, exclude={'hinh_anhs'})
            for key, value in update_data.items():
                if hasattr(variant, key):
                    setattr(variant, key, value)

            # Xử lý ảnh - THÊM DEBUG CHI TIẾT
            if data.hinh_anhs:
                current_images = {img.id: img for img in variant.hinh_anhs}
                new_images = []
                images_to_delete = []
                
                logger.info(f"Biến thể {bien_the_id} có {len(data.hinh_anhs)} ảnh trong request")
                logger.info(f"Ảnh hiện tại trong DB: {list(current_images.keys())}")
                
                # Phân loại ảnh
                for img_idx, img_data in enumerate(data.hinh_anhs):
                    if img_data.id:  # Ảnh cũ
                        if img_data.id in current_images:
                            existing_img = current_images[img_data.id]
                            logger.info(f"Cập nhật ảnh cũ ID: {img_data.id}")
                            if img_data.alt_text is not None:
                                existing_img.alt_text = img_data.alt_text
                            if img_data.thu_tu is not None:
                                existing_img.thu_tu = img_data.thu_tu
                            if img_data.la_anh_dai_dien is not None:
                                existing_img.la_anh_dai_dien = img_data.la_anh_dai_dien
                        else:
                            logger.warning(f"Ảnh cũ ID {img_data.id} không tồn tại trong DB")
                    else:  # Ảnh mới
                        logger.info(f"THÊM ẢNH MỚI - Biến thể {bien_the_id}, ảnh {img_idx}: alt='{img_data.alt_text}', url='{getattr(img_data, 'url', 'N/A')}', public_id='{getattr(img_data, 'public_id', 'N/A')}'")
                        new_images.append(img_data)
                
                # Xóa ảnh không còn trong danh sách
                current_image_ids = {img_data.id for img_data in data.hinh_anhs if img_data.id}
                for img_id, img in current_images.items():
                    if img_id not in current_image_ids:
                        logger.info(f"Xóa ảnh ID: {img_id}")
                        images_to_delete.append(img)
                
                # Xử lý ảnh đại diện
                has_main_image = any(img.la_anh_dai_dien for img in data.hinh_anhs if getattr(img, 'la_anh_dai_dien', False))
                if not has_main_image and (new_images or current_image_ids):
                    first_img = next((img for img in data.hinh_anhs if img.id), None)
                    if first_img and first_img.id in current_images:
                        current_images[first_img.id].la_anh_dai_dien = True
                        logger.info(f"Tự động set ảnh {first_img.id} làm ảnh đại diện")
                    elif new_images:
                        # Nếu có ảnh mới, set ảnh đầu tiên làm đại diện
                        new_images[0].la_anh_dai_dien = True
                        logger.info(f"Tự động set ảnh mới đầu tiên làm ảnh đại diện")
                
                # THÊM ẢNH MỚI - QUAN TRỌNG: ĐẢM BẢO CÓ URL VÀ PUBLIC_ID
                for img_data in new_images:
                    if hasattr(img_data, 'url') and img_data.url and hasattr(img_data, 'public_id') and img_data.public_id:
                        new_img = HinhAnhSanPham(
                            bien_the_id=bien_the_id,
                            url=img_data.url,
                            public_id=img_data.public_id,
                            alt_text=img_data.alt_text,
                            thu_tu=img_data.thu_tu or 1,
                            la_anh_dai_dien=getattr(img_data, 'la_anh_dai_dien', False)
                        )
                        db.session.add(new_img)
                        logger.info(f"✅ ĐÃ THÊM ẢNH MỚI: {img_data.alt_text} với URL: {img_data.url}")
                    else:
                        logger.error(f"❌ Ảnh mới thiếu url hoặc public_id: alt='{img_data.alt_text}', url='{getattr(img_data, 'url', 'N/A')}', public_id='{getattr(img_data, 'public_id', 'N/A')}'")
                
                # Xóa ảnh cũ
                for img in images_to_delete:
                    if not img.la_anh_dai_dien:
                        db.session.delete(img)
                        if img.public_id:
                            delete_image_task.delay(img.public_id)
                        logger.info(f"Đã xóa ảnh: {img.id}")

            db.session.add(variant)
            logger.info(f"✅ Cập nhật biến thể với ảnh thành công | ID: {bien_the_id}")
            return variant

        except Exception as e:
            db.session.rollback()
            logger.error(f"❌ Lỗi cập nhật biến thể với ảnh: {e}", exc_info=True)
            raise BadRequest(f"Lỗi cập nhật biến thể: {str(e)}")

    @staticmethod
    def delete_bien_the(san_pham_id: int, bien_the_id: int):
        """Xóa biến thể"""
        logger.info(f"DELETE /san-pham/{san_pham_id}/bien-the/{bien_the_id}")
        session = db.session

        bien_the = session.query(BienTheSanPham).filter(
            BienTheSanPham.id == bien_the_id,
            BienTheSanPham.san_pham_id == san_pham_id
        ).first()

        if not bien_the:
            logger.warning(f"Không tìm thấy biến thể | san_pham_id={san_pham_id}, bien_the_id={bien_the_id}")
            raise NotFound("Biến thể không tồn tại")

        don_hang_exists = session.query(ChiTietDonHang).filter(
            ChiTietDonHang.bien_the_san_pham_id == bien_the_id
        ).first()

        if don_hang_exists:
            logger.warning(f"Không thể xóa biến thể đã có trong đơn hàng | bien_the_id={bien_the_id}")
            raise BadRequest("Không thể xóa biến thể đã có trong đơn hàng")

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

        try:
            session.delete(bien_the)
            session.commit()
            logger.info(f"Xóa biến thể thành công | ID: {bien_the_id}")
        except Exception as e:
            session.rollback()
            logger.error(f"Lỗi khi xóa biến thể khỏi DB: {e}", exc_info=True)
            raise BadRequest("Lỗi khi xóa biến thể")

        for public_id in public_ids_to_delete:
            try:
                delete_image_task.delay(public_id)
                logger.info(f"Gửi task xóa ảnh Cloudinary: {public_id}")
            except Exception as e:
                logger.error(f"Lỗi khi gửi task xóa ảnh Cloudinary cho public_id={public_id}: {e}")

        return {"message": "Xóa biến thể thành công"}
    
    @staticmethod
    def get_all_san_pham_basic():
        """
        Lấy danh sách tất cả sản phẩm chỉ bao gồm ID và tên
        Sử dụng cho dropdown, autocomplete, etc.
        """
        logger.info("Lấy danh sách sản phẩm cơ bản (ID + Tên)")
        
        try:
            # Query chỉ lấy id và tên sản phẩm, sắp xếp theo tên
            san_phams = SanPham.query.with_entities(
                SanPham.id, 
                SanPham.ten_san_pham
            ).order_by(SanPham.ten_san_pham.asc()).all()
            
            # Chuyển đổi kết quả thành dictionary
            data = [{"id": sp.id, "ten_san_pham": sp.ten_san_pham} for sp in san_phams]
            
            logger.info(f"Lấy danh sách sản phẩm cơ bản thành công: {len(data)} sản phẩm")
            return {"data": data}
            
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách sản phẩm cơ bản: {e}", exc_info=True)
            raise BadRequest(f"Lỗi khi lấy danh sách sản phẩm: {str(e)}")

    @staticmethod
    def get_bien_the_basic_by_san_pham(san_pham_id: int):
        """
        Lấy danh sách biến thể cơ bản (ID + tên) theo ID sản phẩm
        """
        logger.info(f"Lấy danh sách biến thể cơ bản cho sản phẩm ID: {san_pham_id}")
        
        try:
            # Kiểm tra sản phẩm có tồn tại không
            san_pham = SanPham.query.get(san_pham_id)
            if not san_pham:
                logger.warning(f"Sản phẩm không tồn tại: {san_pham_id}")
                raise NotFound("Sản phẩm không tồn tại")
            
            # Query lấy biến thể của sản phẩm, chỉ id và tên
            bien_thes = BienTheSanPham.query.with_entities(
                BienTheSanPham.id,
                BienTheSanPham.ten_bien_the
            ).filter(
                BienTheSanPham.san_pham_id == san_pham_id
            ).order_by(BienTheSanPham.ten_bien_the.asc()).all()
            
            # Chuyển đổi kết quả
            data = [{"id": bt.id, "ten_bien_the": bt.ten_bien_the} for bt in bien_thes]
            
            logger.info(f"Lấy danh sách biến thể cơ bản thành công: {len(data)} biến thể")
            return {"data": data}
            
        except NotFound:
            raise
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách biến thể cơ bản: {e}", exc_info=True)
            raise BadRequest(f"Lỗi khi lấy danh sách biến thể: {str(e)}")
        
        
    @staticmethod
    def get_san_pham_moi_nhat(limit=10):
        """
        Lấy danh sách sản phẩm mới nhất dựa vào ngày tạo, giới hạn theo limit.
        """
        logger.info(f"Lấy danh sách sản phẩm mới nhất, giới hạn: {limit}")
        try:
            san_phams = (
                SanPham.query
                .options(
                    joinedload(SanPham.danh_muc),
                    joinedload(SanPham.thuong_hieu),
                    joinedload(SanPham.cap_do),
                    selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
                )
                .order_by(SanPham.ngay_tao.desc())
                .limit(limit)
                .all()
            )
            data = [SanPhamResponse.model_validate(p).model_dump() for p in san_phams]
            logger.info(f"Lấy danh sách sản phẩm mới nhất thành công: {len(data)} sản phẩm")
            pagination = {
                "total": len(data),
                "page": 1,
                "size": limit,
                "total_pages": 1
            }
            return {"data": data, "pagination": pagination}
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách sản phẩm mới nhất: {e}", exc_info=True)
            raise BadRequest(f"Lỗi khi lấy danh sách sản phẩm mới nhất: {str(e)}")
        

    @staticmethod
    def get_san_pham_lien_quan(san_pham_id: int, limit=8):
        """
        Lấy danh sách sản phẩm liên quan dựa trên cùng danh mục hoặc thương hiệu, loại trừ chính nó.
        """
        logger.info(f"Lấy danh sách sản phẩm liên quan cho sản phẩm ID: {san_pham_id}, limit={limit}")
        try:
            san_pham = SanPham.query.get(san_pham_id)
            if not san_pham:
                logger.warning(f"Sản phẩm không tồn tại: {san_pham_id}")
                raise NotFound("Sản phẩm không tồn tại")

            query = (
                SanPham.query
                .options(
                    joinedload(SanPham.danh_muc),
                    joinedload(SanPham.thuong_hieu),
                    joinedload(SanPham.cap_do),
                    selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
                )
                .filter(
                    or_(
                        SanPham.danh_muc_id == san_pham.danh_muc_id,
                        SanPham.thuong_hieu_id == san_pham.thuong_hieu_id,
                        SanPham.cap_do_id == san_pham.cap_do_id
                    ),
                    SanPham.id != san_pham_id
                )
                .order_by(SanPham.ngay_tao.desc())
                .limit(limit)
            )
            san_phams = query.all()
            data = [SanPhamLienQuanResponse.model_validate(p).model_dump() for p in san_phams]
            logger.info(f"Lấy sản phẩm liên quan thành công: {len(data)} sản phẩm")
            
            return {"data": data}
        except Exception as e:
            logger.error(f"Lỗi khi lấy sản phẩm liên quan: {e}", exc_info=True)
            raise BadRequest(f"Lỗi khi lấy sản phẩm liên quan: {str(e)}")
        
    @staticmethod
    def get_san_pham_noi_bat(limit: int = 8):
        """
        Lấy danh sách sản phẩm nổi bật - phiên bản đơn giản kết hợp
        """
        logger.info(f"Lấy danh sách sản phẩm nổi bật, limit={limit}")
        try:
            # Tính tổng số lượng bán và kết hợp với sản phẩm
            san_phams_with_sales = (
                db.session.query(
                    SanPham,
                    func.coalesce(func.sum(BienTheSanPham.so_luong_ban), 0).label('tong_ban')
                )
                .options(
                    joinedload(SanPham.danh_muc),
                    joinedload(SanPham.thuong_hieu),
                    joinedload(SanPham.cap_do),
                    selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
                )
                .outerjoin(BienTheSanPham, SanPham.id == BienTheSanPham.san_pham_id)
                .group_by(SanPham.id)
                .subquery()
            )

            # Tạo alias cho subquery
            SanPhamWithSales = aliased(SanPham, san_phams_with_sales)
            tong_ban = san_phams_with_sales.c.tong_ban

            # Tính số ngày từ khi tạo
            days_since_created = func.datediff(func.now(), SanPhamWithSales.ngay_tao)
            
            # Công thức tính điểm
            score = (
                (func.coalesce(SanPhamWithSales.so_sao_trung_binh, 0) * func.coalesce(SanPhamWithSales.so_luong_danh_gia, 0)) +
                (func.coalesce(SanPhamWithSales.so_luong_danh_gia, 0) * 0.1) +
                func.greatest(0, 100 - days_since_created) +
                (tong_ban * 0.5)
            )

            results = (
                db.session.query(SanPhamWithSales, score.label('diem_noi_bat'), tong_ban)
                .order_by(desc('diem_noi_bat'))
                .limit(limit)
                .all()
            )

            if not results:
                # Fallback: lấy sản phẩm mới nhất
                logger.info("Không có sản phẩm, lấy sản phẩm mới nhất")
                san_phams = (
                    SanPham.query
                    .options(
                        joinedload(SanPham.danh_muc),
                        joinedload(SanPham.thuong_hieu),
                        joinedload(SanPham.cap_do),
                        selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
                    )
                    .order_by(desc(SanPham.ngay_tao))
                    .limit(limit)
                    .all()
                )
                data = [SanPhamResponse.model_validate(p).model_dump() for p in san_phams]
            else:
                data = [SanPhamResponse.model_validate(p[0]).model_dump() for p in results]

            pagination = {
                "total": len(data),
                "page": 1,
                "size": limit,
                "total_pages": 1
            }
            logger.info(f"Lấy danh sách sản phẩm nổi bật thành công: {len(data)} sản phẩm")
            return {"data": data, "pagination": pagination}
        except Exception as e:
            logger.error(f"Lỗi khi lấy danh sách sản phẩm nổi bật: {e}", exc_info=True)
            raise BadRequest(f"Lỗi khi lấy danh sách sản phẩm nổi bật: {str(e)}")
        
    @staticmethod
    def search_bien_the_by_ten_san_pham(search: str, limit=20):
        """
        Tìm kiếm biến thể theo tên sản phẩm (autocomplete) với tìm kiếm cải tiến.
        Trả về danh sách biến thể với thông tin sản phẩm.
        Tên biến thể sẽ là: tên + màu.
        """
        logger.info(f"Tìm kiếm biến thể theo tên sản phẩm: '{search}', limit={limit}")
        try:
            if not search or not search.strip():
                return {"data": []}

            # Chuẩn hóa từ khóa tìm kiếm
            search_normalized = SanPhamService.remove_accents(search).lower().strip()

            query = (
                db.session.query(BienTheSanPham, SanPham)
                .join(SanPham, BienTheSanPham.san_pham_id == SanPham.id)
                .join(ThuongHieu, SanPham.thuong_hieu_id == ThuongHieu.id)
                .join(DanhMuc, SanPham.danh_muc_id == DanhMuc.id)
            )

            # Cho phép tìm kiếm từ 1 ký tự trở lên
            if len(search_normalized) >= 1:
                search_terms = search_normalized.split()
                search_conditions = []

                for term in search_terms:
                    if len(term) >= 1:
                        term_pattern = f"%{term}%"
                        like_condition = or_(
                            func.lower(func.replace(SanPham.ten_san_pham, ' ', '')).ilike(f"%{term}%"),
                            func.lower(func.replace(SanPham.mo_ta, ' ', '')).ilike(f"%{term}%"),
                            func.lower(func.replace(ThuongHieu.ten_thuong_hieu, ' ', '')).ilike(f"%{term}%"),
                            func.lower(func.replace(DanhMuc.ten_danh_muc, ' ', '')).ilike(f"%{term}%"),
                            SanPham.ma_san_pham.ilike(term_pattern)
                        )
                        search_conditions.append(like_condition)

                if search_conditions:
                    final_search_condition = and_(*search_conditions)
                    query = query.filter(final_search_condition)
                    logger.debug(f"Áp dụng điều kiện tìm kiếm với {len(search_terms)} từ")
            else:
                logger.debug("Từ khóa tìm kiếm quá ngắn, bỏ qua tìm kiếm")
                return {"data": []}

            query = query.order_by(SanPham.ten_san_pham.asc()).limit(limit)
            results = query.all()
            data = [
                {
                    "id": bien_the.id,
                    "ten_bien_the": f"{bien_the.ten_bien_the} {bien_the.mau}".strip()
                }
                for bien_the, san_pham in results
            ]
            logger.info(f"Tìm thấy {len(data)} biến thể phù hợp")
            pagination = {
                "total": len(data),
                "page": 1,
                "size": limit,
                "total_pages": 1
            }
            return {"data": data, "pagination": pagination}
        except Exception as e:
            logger.error(f"Lỗi khi tìm kiếm biến thể theo tên sản phẩm: {e}", exc_info=True)
            raise BadRequest(f"Lỗi khi tìm kiếm biến thể: {str(e)}")
        
    