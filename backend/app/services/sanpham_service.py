# app/services/sanpham_service.py
from http.client import HTTPException
from sqlalchemy.orm import joinedload, selectinload
from ..extensions import db
from ..models.sanpham import SanPham, BienTheSanPham, HinhAnhSanPham, DanhMuc, ThuongHieu, CapDo
from ..models.giohang_dathang import ChiTietDonHang, ChiTietGioHang
from ..schemas.sanpham import (
    SanPhamCreate, SanPhamUpdate, SanPhamResponse,
    BienTheSanPhamCreate, BienTheSanPhamUpdate, SanPhamListResponse,
    HinhAnhCreate, HinhAnhUpdate
)
from .cloudinary_service import *
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import NotFound, BadRequest
from sqlalchemy import func, case, null, text, and_
from ..utils.taoMa import generate_ma_san_pham
from .cloudinary_service import delete_image_task
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
        danh_muc_ids=None,
        cap_do_ids=None
    ):
        """
            Lấy danh sách sản phẩm với các tuỳ chọn lọc, tìm kiếm, sắp xếp và phân trang.

            Tham số:
                page (int, mặc định=1): Số trang hiện tại để phân trang kết quả.
                per_page (int, mặc định=10): Số lượng sản phẩm trên mỗi trang.
                search (str, tuỳ chọn): Từ khoá tìm kiếm toàn văn trên tên và mô tả sản phẩm.
                min_price (float, tuỳ chọn): Giá tối thiểu để lọc sản phẩm.
                max_price (float, tuỳ chọn): Giá tối đa để lọc sản phẩm.
                sort_by_price (str, tuỳ chọn): Sắp xếp theo giá, nhận giá trị 'price_asc' (tăng dần) hoặc 'price_desc' (giảm dần).
                sort_by_name (str, tuỳ chọn): Sắp xếp theo tên sản phẩm, nhận giá trị 'name_asc' (A→Z) hoặc 'name_desc' (Z→A).
                thuong_hieu_ids (list[int], tuỳ chọn): Danh sách ID thương hiệu để lọc sản phẩm.
                danh_muc_ids (list[int], tuỳ chọn): Danh sách ID danh mục để lọc sản phẩm.
                cap_do_ids (list[int], tuỳ chọn): Danh sách ID cấp độ để lọc sản phẩm.
            Hoạt động:
                - Kết hợp các bảng liên quan (danh mục, thương hiệu, biến thể, hình ảnh) để lấy đầy đủ thông tin sản phẩm.
                - Lọc sản phẩm theo danh mục, thương hiệu, cấp độ nếu có.
                - Tìm kiếm toàn văn trên tên và mô tả sản phẩm nếu có từ khoá tìm kiếm.
                - Tính giá hiệu quả (giá bán thấp nhất của các biến thể) để lọc và sắp xếp theo giá.
                - Lọc sản phẩm theo khoảng giá nếu có min_price hoặc max_price.
                - Sắp xếp sản phẩm theo giá hoặc tên nếu có yêu cầu.
                - Thực hiện phân trang kết quả trả về.
                - Chuyển đổi dữ liệu sản phẩm sang định dạng phản hồi phù hợp.
            Kết quả trả về:
                dict: 
                    - "data": Danh sách sản phẩm sau khi lọc, tìm kiếm, sắp xếp và phân trang.
                    - "pagination": Thông tin phân trang gồm số trang hiện tại, số lượng mỗi trang, tổng số sản phẩm và tổng số trang.
            Ghi chú:
                - Hàm sử dụng SQLAlchemy để truy vấn dữ liệu và hỗ trợ phân trang.
                - Có ghi log các thao tác chính để hỗ trợ kiểm tra và debug.
        """
        query = SanPham.query.options(
            joinedload(SanPham.danh_muc),
            joinedload(SanPham.thuong_hieu),
            selectinload(SanPham.cac_bien_the).selectinload(BienTheSanPham.hinh_anhs)
        )
        

        if danh_muc_ids:
            query = query.filter(SanPham.danh_muc_id.in_(danh_muc_ids))

        if thuong_hieu_ids:
            query = query.filter(SanPham.thuong_hieu_id.in_(thuong_hieu_ids))

        if cap_do_ids:
            query = query.filter(SanPham.cap_do_id.in_(cap_do_ids))

        if search:
            logger.debug(f"Tìm kiếm FULLTEXT: '{search}'")
            query = query.filter(
                text("MATCH(ten_san_pham, mo_ta) AGAINST (:search IN BOOLEAN MODE)")
            ).params(search=search)

        effective_price =BienTheSanPham.gia_ban

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
        """
        Lấy thông tin chi tiết của một sản phẩm dựa trên ID.
        Hàm này thực hiện các bước sau:
        - Ghi log truy vấn lấy sản phẩm theo ID.
        - Truy vấn cơ sở dữ liệu để lấy sản phẩm với ID tương ứng, đồng thời lấy kèm các thông tin liên quan như:
            + Danh mục sản phẩm (danh_muc)
            + Thương hiệu sản phẩm (thuong_hieu)
            + Cấp độ sản phẩm (cap_do)
            + Các biến thể của sản phẩm (cac_bien_the) và hình ảnh của từng biến thể (hinh_anhs)
        - Nếu không tìm thấy sản phẩm, ghi log cảnh báo và ném ra ngoại lệ ProductNotFound.
        - Trả về đối tượng sản phẩm nếu tìm thấy.
        Tham số:
            san_pham_id (int): ID của sản phẩm cần lấy thông tin.
        Trả về:
            SanPham: Đối tượng sản phẩm với đầy đủ thông tin liên quan.
        Ngoại lệ:
            ProductNotFound: Nếu không tìm thấy sản phẩm với ID đã cho.
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
        Quy trình thực hiện:
        1. Kiểm tra sự tồn tại của danh mục, thương hiệu và cấp độ dựa trên các ID được cung cấp trong dữ liệu đầu vào.
            - Nếu không tìm thấy danh mục hoặc thương hiệu hoặc cấp độ, trả về lỗi tương ứng.
        2. Sinh mã sản phẩm tự động dựa trên mã danh mục và mã thương hiệu.
        3. Tạo đối tượng sản phẩm mới với các thông tin cơ bản như tên, mô tả, thông số kỹ thuật, ngày tạo và ngày cập nhật.
        4. Nếu có danh sách biến thể sản phẩm:
            - Lặp qua từng biến thể, tạo mới biến thể sản phẩm với các thuộc tính như tên, trạng thái kích hoạt, màu sắc, giá bán.
            - Nếu biến thể có danh sách hình ảnh:
                - Lặp qua từng hình ảnh, tạo mới hình ảnh sản phẩm với các thông tin như url, public_id, alt_text, là ảnh đại diện, thứ tự.
        5. Lưu toàn bộ thông tin vào cơ sở dữ liệu.
        6. Nếu có lỗi trong quá trình thực hiện, rollback giao dịch và trả về thông báo lỗi.
        Tham số:
            data (SanPhamCreate): Dữ liệu đầu vào để tạo sản phẩm, bao gồm thông tin sản phẩm, biến thể và hình ảnh.
        Trả về:
            SanPham: Đối tượng sản phẩm vừa được tạo thành công.
        Ngoại lệ:
            NotFound: Nếu danh mục, thương hiệu hoặc cấp độ không tồn tại.
            BadRequest: Nếu có lỗi trong quá trình tạo sản phẩm.
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
            cap_do = db.session.query(CapDo).get(data.cap_do_id)
            if not cap_do:
                raise NotFound("Thương hiệu không tồn tại")
            
            # Bước 2: Generate mã
            ma_san_pham = generate_ma_san_pham(danh_muc.ma_danh_muc[:5], thuong_hieu.ma_thuong_hieu[:5])
            
            # Bước 3: Tạo sản phẩm
            new_san_pham = SanPham(
                ma_san_pham=ma_san_pham,
                danh_muc_id=data.danh_muc_id,
                thuong_hieu_id=data.thuong_hieu_id,
                cap_do_id = data.cap_do_id,
                ten_san_pham=data.ten_san_pham,
                mo_ta=data.mo_ta,
                thong_so_ky_thuat=data.thong_so_ky_thuat,
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
                        mau = bt_data.mau,
                        gia_ban=bt_data.gia_ban,
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
    def update_san_pham(san_pham_id: int, data: SanPhamUpdate):
        """
        Cập nhật thông tin sản phẩm dựa trên ID và dữ liệu đầu vào.
        Tham số:
            san_pham_id (int): ID của sản phẩm cần cập nhật.
            data (SanPhamUpdate): Dữ liệu cập nhật cho sản phẩm, bao gồm các trường có thể thay đổi.
        Quy trình thực hiện:
            - Ghi log truy cập endpoint PUT với ID sản phẩm.
            - Lấy thông tin sản phẩm từ cơ sở dữ liệu dựa trên ID.
            - Trích xuất các trường cần cập nhật từ dữ liệu đầu vào (chỉ lấy các trường được truyền lên).
            - Nếu không có trường nào được cập nhật, ghi log và trả về sản phẩm hiện tại.
            - Thực hiện cập nhật từng trường nếu có trong dữ liệu đầu vào:
                + danh_muc_id: Cập nhật danh mục sản phẩm.
                + thuong_hieu_id: Cập nhật thương hiệu sản phẩm.
                + cap_do_id: Cập nhật cấp độ sản phẩm.
                + ten_san_pham: Cập nhật tên sản phẩm.
                + mo_ta: Cập nhật mô tả sản phẩm.
                + thong_so_ky_thuat: Cập nhật thông số kỹ thuật.
                + trang_thai: Cập nhật trạng thái sản phẩm.
            - Cập nhật trường ngày_cập_nhat với thời gian hiện tại.
            - Thêm sản phẩm vào session và kiểm tra ràng buộc UNIQUE nếu có.
            - Nếu dữ liệu đầu vào có danh sách các biến thể (cac_bien_the), thực hiện cập nhật từng biến thể thông qua hàm update_bien_the.
            - Ghi log thành công (chưa commit).
            - Trả về đối tượng sản phẩm đã được cập nhật.
        Xử lý ngoại lệ:
            - Nếu vi phạm ràng buộc dữ liệu (IntegrityError), ghi log và trả về lỗi BadRequest với thông báo phù hợp.
            - Nếu có lỗi không xác định, ghi log và trả về lỗi BadRequest với thông báo lỗi chi tiết.
        Trả về:
            SanPham: Đối tượng sản phẩm đã được cập nhật (chưa commit vào database).
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
            if 'cap_do_id' in update_data:
                san_pham.cap_do_id = update_data['cap_do_id']
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
        Xóa một sản phẩm dựa trên ID sản phẩm.

        Quy trình thực hiện:
            1. Kiểm tra sản phẩm có tồn tại trong hệ thống hay không.
            2. Thu thập tất cả các public_id của ảnh thuộc các biến thể của sản phẩm để phục vụ cho việc xóa ảnh trên cloud.
            3. Kiểm tra xem có biến thể nào của sản phẩm đã từng xuất hiện trong các đơn hàng hay chưa.
                - Nếu có, không cho phép xóa sản phẩm và thông báo lỗi.
            4. Xóa sản phẩm khỏi cơ sở dữ liệu (bao gồm cả các biến thể và ảnh liên quan nhờ cơ chế cascade).
            5. Trả về danh sách các public_id của ảnh để xử lý xóa ảnh ở các bước tiếp theo.
        Tham số:
            san_pham_id (int): ID của sản phẩm cần xóa.
        Giá trị trả về:
            List[str]: Danh sách các public_id của ảnh thuộc các biến thể của sản phẩm đã bị xóa.
        Ngoại lệ:
            BadRequest: Nếu sản phẩm không tồn tại, có biến thể đã nằm trong đơn hàng, hoặc có lỗi trong quá trình xóa.
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

    @staticmethod
    def add_hinh_anh_to_bien_the(bien_the_id: int, hinh_anh_data: HinhAnhCreate):
        """
        Thêm một hình ảnh mới cho biến thể sản phẩm.
        Các bước thực hiện:
        1. Kiểm tra biến thể sản phẩm với ID cung cấp có tồn tại trong cơ sở dữ liệu hay không.
           - Nếu không tồn tại, ghi log cảnh báo và ném ngoại lệ NotFound.
        2. Nếu hình ảnh mới được đánh dấu là ảnh đại diện (`la_anh_dai_dien=True`), 
           cập nhật tất cả các ảnh hiện tại của biến thể này thành không phải ảnh đại diện.
        3. Tạo đối tượng hình ảnh mới với các thông tin từ `hinh_anh_data` (bao gồm url, public_id, alt_text, 
           trạng thái đại diện, thứ tự).
        4. Thêm hình ảnh mới vào session của cơ sở dữ liệu.
        5. Thực hiện flush session để đảm bảo dữ liệu hợp lệ trước khi commit ở tầng route.
        6. Ghi log thông tin về việc thêm ảnh thành công.
        Tham số:
            bien_the_id (int): ID của biến thể sản phẩm cần thêm ảnh.
            hinh_anh_data (HinhAnhCreate): Dữ liệu hình ảnh cần thêm.
        Trả về:
            HinhAnhSanPham: Đối tượng hình ảnh sản phẩm vừa được thêm vào session.
        Ngoại lệ:
            NotFound: Nếu biến thể sản phẩm không tồn tại.
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
            la_anh_dai_dien=hinh_anh_data.la_anh_dai_dien,
            thu_tu = hinh_anh_data.thu_tu
        )
        db.session.add(new_hinh_anh)
        
        # Commit ở route, nhưng flush để kiểm tra
        db.session.flush()
        logger.info(f"Thêm ảnh thành công cho biến thể {bien_the_id}")
        return new_hinh_anh

    @staticmethod
    def update_hinh_anh(hinh_anh_id: int, update_data: HinhAnhUpdate):
        """
        Cập nhật thông tin một hình ảnh sản phẩm dựa trên ID và dữ liệu đầu vào.

        Các bước thực hiện:
        1. Ghi log truy cập endpoint cập nhật ảnh.
        2. Kiểm tra sự tồn tại của hình ảnh với ID cung cấp.
            - Nếu không tồn tại, ghi log cảnh báo và ném ngoại lệ NotFound.
        3. Lấy dữ liệu cập nhật từ đối tượng update_data (chỉ lấy các trường được truyền lên).
        4. Nếu không có trường nào được cập nhật, trả về đối tượng hình ảnh hiện tại.
        5. Nếu trường la_anh_dai_dien được cập nhật thành True, reset tất cả các ảnh khác của biến thể này thành không phải đại diện.
        6. Cập nhật các trường của hình ảnh theo dữ liệu đầu vào.
        7. Thêm hình ảnh vào session và flush để kiểm tra dữ liệu hợp lệ.
        8. Ghi log thành công và trả về đối tượng hình ảnh đã được cập nhật.

        Tham số:
             hinh_anh_id (int): ID của hình ảnh cần cập nhật.
             update_data (HinhAnhUpdate): Dữ liệu cập nhật cho hình ảnh.

        Trả về:
             HinhAnhSanPham: Đối tượng hình ảnh đã được cập nhật (chưa commit vào database).

        Ngoại lệ:
             NotFound: Nếu không tìm thấy hình ảnh với ID đã cho.
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
        Xóa một hình ảnh sản phẩm khỏi cơ sở dữ liệu và gửi tác vụ xóa ảnh trên Cloudinary.

        Tham số:
            hinh_anh_id (int): ID của hình ảnh cần xóa.
            bienthexoa (bool, mặc định=False): Nếu là True, kiểm tra và không cho phép xóa nếu ảnh là ảnh đại diện.
        Quy trình thực hiện:
            1. Kiểm tra sự tồn tại của hình ảnh với ID cung cấp. Nếu không tồn tại, ghi log cảnh báo và trả về lỗi NotFound.
            2. Nếu hình ảnh là ảnh đại diện và biến 'bienthexoa' là True, không cho phép xóa, ghi log cảnh báo và trả về lỗi BadRequest.
            3. Xóa hình ảnh khỏi cơ sở dữ liệu, ghi log thành công.
            4. Nếu hình ảnh có 'public_id', gửi tác vụ bất đồng bộ để xóa ảnh trên Cloudinary sau khi commit.
            5. Trả về thông báo thành công.
        Ngoại lệ:
            NotFound: Nếu hình ảnh không tồn tại.
            BadRequest: Nếu cố gắng xóa ảnh đại diện khi không được phép.
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
            delete_image_task.delay(public_id)
            logger.info(f"Gửi task xóa Cloudinary: {public_id}")
        
        return {"message": "Xóa ảnh thành công"}

    @staticmethod
    def create_bien_the(san_pham_id: int, data: BienTheSanPhamCreate):
        """
        Tạo một biến thể mới cho sản phẩm dựa trên ID sản phẩm và dữ liệu đầu vào.

        Các bước thực hiện:
        1. Kiểm tra sự tồn tại của sản phẩm với ID được cung cấp. Nếu không tồn tại, trả về lỗi "Sản phẩm không tồn tại".
        2. Tạo một đối tượng biến thể sản phẩm mới với các thông tin: tên biến thể, trạng thái kích hoạt, giá bán, màu sắc.
        3. Thêm biến thể mới vào session và flush để lấy ID của biến thể vừa tạo.
        4. Nếu có danh sách hình ảnh đi kèm:
            - Kiểm tra xem có hình ảnh nào được đánh dấu là ảnh đại diện chưa. Nếu chưa, tự động chọn ảnh đầu tiên làm ảnh đại diện.
            - Thêm từng hình ảnh vào biến thể thông qua phương thức add_hinh_anh_to_bien_the.
        5. Ghi log quá trình thêm biến thể và trả về đối tượng biến thể vừa tạo.
        Args:
            san_pham_id (int): ID của sản phẩm cần thêm biến thể.
            data (BienTheSanPhamCreate): Dữ liệu đầu vào cho biến thể, bao gồm thông tin biến thể và danh sách hình ảnh.
        Returns:
            BienTheSanPham: Đối tượng biến thể sản phẩm vừa được tạo.
        Raises:
            NotFound: Nếu sản phẩm với ID cung cấp không tồn tại.
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
            mau=data.mau
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
        Cập nhật thông tin biến thể sản phẩm theo ID sản phẩm và ID biến thể.
        Quy trình thực hiện:
        1. Kiểm tra sự tồn tại của biến thể dựa trên `san_pham_id` và `bien_the_id`.
           - Nếu không tìm thấy biến thể, ghi log cảnh báo và trả về lỗi NotFound.
        2. Cập nhật các trường cơ bản của biến thể từ dữ liệu truyền vào (ngoại trừ trường hình ảnh).
        3. Xử lý cập nhật danh sách hình ảnh:
           - Phân loại hình ảnh mới (chưa có id) và hình ảnh cũ (đã có id).
           - Thêm các hình ảnh mới vào biến thể.
           - Cập nhật thông tin các hình ảnh cũ nếu có thay đổi (ví dụ: ảnh đại diện, alt_text).
           - Đảm bảo luôn có ít nhất một ảnh đại diện cho biến thể. Nếu không có ảnh nào được chọn làm đại diện, tự động chọn ảnh đầu tiên.
        4. Lưu thay đổi vào cơ sở dữ liệu và ghi log thành công.
        5. Xử lý các lỗi có thể xảy ra trong quá trình cập nhật:
           - Nếu lỗi ràng buộc dữ liệu (IntegrityError), rollback và trả về lỗi BadRequest.
           - Nếu lỗi khác, rollback và trả về lỗi BadRequest kèm thông báo lỗi chi tiết.
        Tham số:
            san_pham_id (int): ID của sản phẩm chứa biến thể.
            bien_the_id (int): ID của biến thể cần cập nhật.
            data (BienTheSanPhamUpdate): Dữ liệu cập nhật cho biến thể.
        Trả về:
            BienTheSanPham: Đối tượng biến thể sau khi đã được cập nhật.
        Ngoại lệ:
            NotFound: Nếu không tìm thấy biến thể.
            BadRequest: Nếu có lỗi trong quá trình cập nhật dữ liệu.
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
        Xóa một biến thể sản phẩm dựa trên ID sản phẩm và ID biến thể.

        Quy trình thực hiện:
        1. Kiểm tra biến thể có tồn tại và thuộc về sản phẩm tương ứng không.
            - Nếu không tồn tại, trả về lỗi "Biến thể không tồn tại".
        2. Kiểm tra biến thể đã từng xuất hiện trong chi tiết đơn hàng chưa.
            - Nếu đã có trong đơn hàng, không cho phép xóa và trả về lỗi.
        3. Lấy danh sách các hình ảnh liên quan đến biến thể để chuẩn bị xóa (cả trong DB và Cloudinary).
            - Xóa từng ảnh trong cơ sở dữ liệu, nếu có lỗi sẽ rollback và trả về lỗi.
            - Lưu lại danh sách public_id của ảnh để xóa trên Cloudinary sau khi commit DB thành công.
        4. Xóa biến thể khỏi cơ sở dữ liệu.
            - Nếu có lỗi khi xóa, rollback và trả về lỗi.
        5. Sau khi xóa thành công trong DB, gửi các task xóa ảnh lên Cloudinary (bằng Celery task).
            - Nếu gửi task thất bại, ghi log lỗi nhưng không ảnh hưởng đến kết quả trả về.
        6. Trả về thông báo thành công nếu toàn bộ quá trình hoàn tất.

        Tham số:
            san_pham_id (int): ID của sản phẩm chứa biến thể cần xóa.
            bien_the_id (int): ID của biến thể cần xóa.
        Trả về:
            dict: Thông báo kết quả xóa biến thể.
        Ngoại lệ:
            NotFound: Nếu biến thể không tồn tại hoặc không thuộc sản phẩm.
            BadRequest: Nếu biến thể đã có trong đơn hàng hoặc có lỗi khi xóa ảnh/biến thể trong DB.
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
                delete_image_task.delay(public_id)
                logger.info(f"Gửi task xóa ảnh Cloudinary: {public_id}")
            except Exception as e:
                logger.error(f"Lỗi khi gửi task xóa ảnh Cloudinary cho public_id={public_id}: {e}")

        return {"message": "Xóa biến thể thành công"}
    
    @staticmethod
    def update_san_pham_with_variants(san_pham_id: int, data: SanPhamUpdate):
        """
        Cập nhật thông tin sản phẩm cùng với các biến thể của sản phẩm.
        Tham số:
            san_pham_id (int): ID của sản phẩm cần cập nhật.
            data (SanPhamUpdate): Dữ liệu cập nhật sản phẩm, bao gồm thông tin cơ bản, danh sách biến thể mới/cập nhật và danh sách ID biến thể cần xóa.
        Các hoạt động chính:
            - Ghi log bắt đầu quá trình cập nhật sản phẩm.
            - Lấy thông tin sản phẩm theo ID.
            - Cập nhật các trường thông tin cơ bản của sản phẩm (ngoại trừ các trường liên quan đến biến thể).
            - Nếu có danh sách ID biến thể cần xóa, thực hiện xóa từng biến thể tương ứng khỏi sản phẩm.
            - Nếu có danh sách biến thể mới/cập nhật:
                + Nếu biến thể đã có ID: cập nhật thông tin và hình ảnh cho biến thể đó.
                + Nếu biến thể chưa có ID: tạo mới biến thể cho sản phẩm.
            - Cập nhật trường ngày cập nhật của sản phẩm thành thời điểm hiện tại.
            - Lưu thay đổi vào cơ sở dữ liệu.
            - Ghi log hoàn thành quá trình cập nhật sản phẩm.
            - Trả về đối tượng sản phẩm sau khi đã cập nhật.
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
    def update_bien_the_with_images(san_pham_id: int, bien_the_id: int, data: BienTheSanPhamUpdate):
        """
        Cập nhật biến thể bao gồm cả ảnh (thêm, sửa, xóa, thay đổi thứ tự).
        """
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

            # Xử lý ảnh
            if data.hinh_anhs:
                current_images = {img.id: img for img in variant.hinh_anhs}
                new_images = []
                images_to_delete = []
                
                # Phân loại ảnh
                for img_data in data.hinh_anhs:
                    if img_data.id:  # Ảnh cũ
                        if img_data.id in current_images:
                            # Cập nhật thông tin ảnh cũ
                            existing_img = current_images[img_data.id]
                            if img_data.alt_text is not None:
                                existing_img.alt_text = img_data.alt_text
                            if img_data.thu_tu is not None:
                                existing_img.thu_tu = img_data.thu_tu
                            if img_data.la_anh_dai_dien is not None:
                                existing_img.la_anh_dai_dien = img_data.la_anh_dai_dien
                    else:  # Ảnh mới
                        new_images.append(img_data)
                
                # Xóa ảnh không còn trong danh sách
                current_image_ids = {img_data.id for img_data in data.hinh_anhs if img_data.id}
                for img_id, img in current_images.items():
                    if img_id not in current_image_ids:
                        images_to_delete.append(img)
                
                # Xử lý ảnh đại diện
                has_main_image = any(img.la_anh_dai_dien for img in data.hinh_anhs if getattr(img, 'la_anh_dai_dien', False))
                if not has_main_image and (new_images or current_image_ids):
                    # Tự động set ảnh đầu tiên làm đại diện
                    first_img = next((img for img in data.hinh_anhs if img.id), None)
                    if first_img and first_img.id in current_images:
                        current_images[first_img.id].la_anh_dai_dien = True
                
                # Thêm ảnh mới
                for img_data in new_images:
                    new_img = HinhAnhSanPham(
                        bien_the_id=bien_the_id,
                        url=img_data.url,
                        public_id=img_data.public_id,
                        alt_text=img_data.alt_text,
                        thu_tu=img_data.thu_tu,
                        la_anh_dai_dien=img_data.la_anh_dai_dien or False
                    )
                    db.session.add(new_img)
                
                # Xóa ảnh cũ
                for img in images_to_delete:
                    if not img.la_anh_dai_dien:  # Không cho xóa ảnh đại diện
                        db.session.delete(img)
                        # Gửi task xóa Cloudinary
                        if img.public_id:
                            delete_image_task.delay(img.public_id)

            db.session.add(variant)
            logger.info(f"Cập nhật biến thể với ảnh thành công | ID: {bien_the_id}")
            return variant

        except Exception as e:
            db.session.rollback()
            logger.error(f"Lỗi cập nhật biến thể với ảnh: {e}", exc_info=True)
            raise BadRequest(f"Lỗi cập nhật biến thể: {str(e)}")