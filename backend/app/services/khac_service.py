# /backend/app/services/catalogs_service.py
import logging
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import NotFound, BadRequest
from ..extensions import db
from ..models.sanpham.DanhMuc import DanhMuc
from ..models.sanpham.ThuongHieu import ThuongHieu
from ..models.sanpham import SanPham # Import SanPham để kiểm tra
from ..schemas.sanpham.DanhMuc import DanhMucCreate, DanhMucUpdate
from ..schemas.sanpham.ThuongHieu import ThuongHieuCreate, ThuongHieuUpdate

# Logger riêng cho service
logger = logging.getLogger(__name__)

# --- Định nghĩa Exception tùy chỉnh ---
class DanhMucNotFound(NotFound):
    def __init__(self, message="Danh mục không tồn tại"):
        super().__init__(description=message)

class ThuongHieuNotFound(NotFound):
    def __init__(self, message="Thương hiệu không tồn tại"):
        super().__init__(description=message)

# ==============================================================
# CLASS DỊCH VỤ GỘP
# ==============================================================
class CatalogsService:

    # ==============================================================
    # 1. LOGIC CHO DANH MỤC
    # ==============================================================

    @staticmethod
    def get_all_danh_muc(page=1, per_page=10):
        """
        Lấy danh sách tất cả danh mục (có phân trang).
        """
        logger.info(f"SERVICE | GET /danh-muc | page={page}, per_page={per_page}")
        pagination = DanhMuc.query.paginate(page=page, per_page=per_page, error_out=False)
        return pagination

    @staticmethod
    def get_danh_muc_by_id(danh_muc_id: int):
        """
        Lấy chi tiết một danh mục bằng ID.
        """
        logger.info(f"SERVICE | GET /danh-muc/{danh_muc_id}")
        danh_muc = DanhMuc.query.get(danh_muc_id)
        if not danh_muc:
            logger.warning(f"Không tìm thấy danh mục ID: {danh_muc_id}")
            raise DanhMucNotFound()
        return danh_muc

    @staticmethod
    def create_danh_muc(data: DanhMucCreate):
        """
        Tạo một danh mục mới.
        """
        logger.info("SERVICE | POST /danh-muc | Tạo danh mục")
        try:
            new_danh_muc = DanhMuc(
                ma_danh_muc=data.ma_danh_muc,
                ten_danh_muc=data.ten_danh_muc
            )
            db.session.add(new_danh_muc)
            db.session.flush() # flush() để kiểm tra UNIQUE ngay
            logger.info(f"Tạo danh mục thành công (chưa commit) | Mã: {data.ma_danh_muc}")
            return new_danh_muc
        except IntegrityError as e:
            logger.error(f"IntegrityError khi tạo danh mục: {e}", exc_info=True)
            raise BadRequest("Dữ liệu vi phạm ràng buộc (mã hoặc tên đã tồn tại).")
        except Exception as e:
            logger.error(f"Lỗi không xác định khi tạo danh mục: {e}", exc_info=True)
            raise BadRequest(f"Lỗi tạo danh mục: {str(e)}")

    @staticmethod
    def update_danh_muc(danh_muc_id: int, data: DanhMucUpdate):
        """
        Cập nhật thông tin một danh mục.
        """
        logger.info(f"SERVICE | PUT /danh-muc/{danh_muc_id}")
        danh_muc = CatalogsService.get_danh_muc_by_id(danh_muc_id)
        update_data = data.model_dump(exclude_unset=True)
        
        if not update_data:
            logger.info("Không có trường nào được cập nhật cho danh mục")
            return danh_muc

        try:
            if 'ma_danh_muc' in update_data:
                danh_muc.ma_danh_muc = update_data['ma_danh_muc']
            if 'ten_danh_muc' in update_data:
                danh_muc.ten_danh_muc = update_data['ten_danh_muc']

            db.session.add(danh_muc)
            db.session.flush() # Kiểm tra UNIQUE
            logger.info(f"Cập nhật danh mục thành công (chưa commit) | ID: {danh_muc_id}")
            return danh_muc
        except IntegrityError as e:
            logger.error(f"IntegrityError khi cập nhật danh mục: {e}", exc_info=True)
            raise BadRequest("Dữ liệu vi phạm ràng buộc (mã hoặc tên đã tồn tại).")
        except Exception as e:
            logger.error(f"Lỗi không xác định khi cập nhật danh mục: {e}", exc_info=True)
            raise BadRequest(f"Lỗi cập nhật danh mục: {str(e)}")

    @staticmethod
    def delete_danh_muc(danh_muc_id: int):
        """
        Xóa một danh mục.
        """
        logger.info(f"SERVICE | DELETE /danh-muc/{danh_muc_id}")
        danh_muc = CatalogsService.get_danh_muc_by_id(danh_muc_id)

        # Logic nghiệp vụ: Không cho xóa nếu có sản phẩm
        existing_product = db.session.query(SanPham.id).filter_by(danh_muc_id=danh_muc_id).first()
        if existing_product:
            logger.warning(f"Không thể xóa danh mục ID: {danh_muc_id} vì có sản phẩm liên quan.")
            raise BadRequest("Không thể xóa danh mục vì đang có sản phẩm thuộc danh mục này.")

        db.session.delete(danh_muc)
        logger.info(f"Xóa danh mục thành công (chưa commit) | ID: {danh_muc_id}")
        return True

    # ==============================================================
    # 2. LOGIC CHO THƯƠNG HIỆU
    # ==============================================================

    @staticmethod
    def get_all_thuong_hieu(page=1, per_page=10):
        """
        Lấy danh sách tất cả thương hiệu (có phân trang).
        """
        logger.info(f"SERVICE | GET /thuong-hieu | page={page}, per_page={per_page}")
        pagination = ThuongHieu.query.paginate(page=page, per_page=per_page, error_out=False)
        return pagination

    @staticmethod
    def get_thuong_hieu_by_id(thuong_hieu_id: int):
        """
        Lấy chi tiết một thương hiệu bằng ID.
        """
        logger.info(f"SERVICE | GET /thuong-hieu/{thuong_hieu_id}")
        thuong_hieu = ThuongHieu.query.get(thuong_hieu_id)
        if not thuong_hieu:
            logger.warning(f"Không tìm thấy thương hiệu ID: {thuong_hieu_id}")
            raise ThuongHieuNotFound()
        return thuong_hieu

    @staticmethod
    def create_thuong_hieu(data: ThuongHieuCreate):
        """
        Tạo một thương hiệu mới.
        """
        logger.info("SERVICE | POST /thuong-hieu | Tạo thương hiệu")
        try:
            new_thuong_hieu = ThuongHieu(
                ma_thuong_hieu=data.ma_thuong_hieu,
                ten_thuong_hieu=data.ten_thuong_hieu,
                logo_url=data.logo_url,
                public_id=data.public_id
            )
            db.session.add(new_thuong_hieu)
            db.session.flush() # Kiểm tra UNIQUE
            logger.info(f"Tạo thương hiệu thành công (chưa commit) | Mã: {data.ma_thuong_hieu}")
            return new_thuong_hieu
        except IntegrityError as e:
            logger.error(f"IntegrityError khi tạo thương hiệu: {e}", exc_info=True)
            raise BadRequest("Dữ liệu vi phạm ràng buộc (mã, tên hoặc public_id đã tồn tại).")
        except Exception as e:
            logger.error(f"Lỗi không xác định khi tạo thương hiệu: {e}", exc_info=True)
            raise BadRequest(f"Lỗi tạo thương hiệu: {str(e)}")

    @staticmethod
    def update_thuong_hieu(thuong_hieu_id: int, data: ThuongHieuUpdate):
        """
        Cập nhật thông tin một thương hiệu.
        """
        logger.info(f"SERVICE | PUT /thuong-hieu/{thuong_hieu_id}")
        thuong_hieu = CatalogsService.get_thuong_hieu_by_id(thuong_hieu_id)
        update_data = data.model_dump(exclude_unset=True)
        
        if not update_data:
            logger.info("Không có trường nào được cập nhật cho thương hiệu")
            return thuong_hieu

        try:
            if 'ma_thuong_hieu' in update_data:
                thuong_hieu.ma_thuong_hieu = update_data['ma_thuong_hieu']
            if 'ten_thuong_hieu' in update_data:
                thuong_hieu.ten_thuong_hieu = update_data['ten_thuong_hieu']
            if 'logo_url' in update_data:
                thuong_hieu.logo_url = update_data['logo_url']
            
            # Lưu ý: Nếu logic upload/update logo phức tạp
            # (ví dụ: upload file -> nhận public_id -> update),
            # chúng ta nên tách ra một endpoint/service riêng cho việc đó.
            # Hiện tại, ta giả định `logo_url` và `public_id` được cập nhật riêng.

            db.session.add(thuong_hieu)
            db.session.flush() # Kiểm tra UNIQUE
            logger.info(f"Cập nhật thương hiệu thành công (chưa commit) | ID: {thuong_hieu_id}")
            return thuong_hieu
        except IntegrityError as e:
            logger.error(f"IntegrityError khi cập nhật thương hiệu: {e}", exc_info=True)
            raise BadRequest("Dữ liệu vi phạm ràng buộc (mã hoặc tên đã tồn tại).")
        except Exception as e:
            logger.error(f"Lỗi không xác định khi cập nhật thương hiệu: {e}", exc_info=True)
            raise BadRequest(f"Lỗi cập nhật thương hiệu: {str(e)}")

    @staticmethod
    def delete_thuong_hieu(thuong_hieu_id: int):
        """
        Xóa một thương hiệu.
        """
        logger.info(f"SERVICE | DELETE /thuong-hieu/{thuong_hieu_id}")
        thuong_hieu = CatalogsService.get_thuong_hieu_by_id(thuong_hieu_id)

        # Logic nghiệp vụ: Không cho xóa nếu có sản phẩm
        existing_product = db.session.query(SanPham.id).filter_by(thuong_hieu_id=thuong_hieu_id).first()
        if existing_product:
            logger.warning(f"Không thể xóa thương hiệu ID: {thuong_hieu_id} vì có sản phẩm liên quan.")
            raise BadRequest("Không thể xóa thương hiệu vì đang có sản phẩm thuộc thương hiệu này.")

        # Xóa khỏi DB. Event 'after_delete' (trong model ThuongHieu)
        # sẽ tự động kích hoạt task Celery để xóa ảnh Cloudinary sau khi commit.
        db.session.delete(thuong_hieu)
        logger.info(f"Xóa thương hiệu thành công (chưa commit) | ID: {thuong_hieu_id}")
        return True