# /backend/app/services/danhgia_service.py
from ..extensions import db
from sqlalchemy.orm import joinedload
from typing import List
import logging  # THÊM: Import logging

# THÊM: Logger riêng cho service
logger = logging.getLogger(__name__)

# đường dẫn import models
from ..models.extras import DanhGia, TrangThaiDanhGia
from ..models.sanpham import SanPham
from ..models.giohang_dathang import ChiTietDonHang 

# Import lỗi tùy chỉnh từ sanpham_service
from .sanpham_service import SanPhamService, ProductNotFound

# đường dẫn import schemas
from ..schemas.extras import DanhGiaCreate, DanhGiaUpdate

# Các lỗi nghiệp vụ
class ReviewError(Exception):
    """Lỗi chung cho đánh giá"""
    pass

class PermissionDeniedError(ReviewError):
    """Không có quyền"""
    pass

class AlreadyReviewedError(ReviewError):
    """Đã đánh giá rồi"""
    pass

class OrderNotCompletedError(ReviewError):
    """Đơn hàng chưa hoàn thành"""
    pass

class InvalidDataError(ReviewError):
    """Dữ liệu không hợp lệ"""
    pass


class DanhGiaService:

    @staticmethod
    def get_reviews_for_product(product_id: int, page: int, per_page: int):
        """
        Lấy danh sách đánh giá (có phân trang) cho một sản phẩm.
        Chỉ trả về các đánh giá 'DA_DUYET'.
        """
        logger.info(f"GET /san-pham/{product_id}/danh-gia | Lấy đánh giá | page={page}, per_page={per_page}")

        try:
            # 1. Lấy sản phẩm (sẽ raise ProductNotFound nếu không tồn tại)
            product = SanPhamService.get_product_by_id(product_id)
            logger.debug(f"Tìm thấy sản phẩm ID: {product_id}")

            # 2. Lấy query đánh giá
            reviews_query = product.danh_gias
            logger.debug(f"Tổng đánh giá thô: {reviews_query.count()}")

            # 3. Lọc theo trạng thái
            reviews_query = reviews_query.filter(
                DanhGia.trang_thai == TrangThaiDanhGia.DA_DUYET
            )
            logger.debug(f"Đã lọc chỉ đánh giá 'DA_DUYET'")

            # 4. Tải sẵn thông tin người dùng
            reviews_query = reviews_query.options(
                joinedload(DanhGia.nguoi_dung)
            )

            # 5. Sắp xếp & phân trang
            paginated_reviews = reviews_query.order_by(DanhGia.ngay_tao.desc()).paginate(
                page=page,
                per_page=per_page,
                error_out=False
            )

            logger.info(
                f"Lấy đánh giá thành công | product_id: {product_id}, "
                f"total: {paginated_reviews.total}, pages: {paginated_reviews.pages}"
            )
            return paginated_reviews

        except ProductNotFound:
            logger.warning(f"Sản phẩm không tồn tại: {product_id}")
            raise
        except Exception as e:
            logger.error(f"Lỗi khi lấy đánh giá cho sản phẩm {product_id}: {e}", exc_info=True)
            raise ReviewError("Lỗi hệ thống khi lấy đánh giá")

    @staticmethod
    def create_review(user_id: int, data: DanhGiaCreate) -> DanhGia:
        """
        Tạo một đánh giá mới.
        """
        logger.info(f"POST /danh-gia | Tạo đánh giá mới | user_id: {user_id}, chi_tiet_don_hang_id: {data.chi_tiet_don_hang_id}")

        try:
            # 1. Kiểm tra chi tiết đơn hàng tồn tại
            order_detail = db.session.get(ChiTietDonHang, data.chi_tiet_don_hang_id)
            if not order_detail:
                logger.warning(f"Không tìm thấy chi tiết đơn hàng ID: {data.chi_tiet_don_hang_id}")
                raise InvalidDataError("Không tìm thấy chi tiết đơn hàng.")

            logger.debug(f"Tìm thấy chi tiết đơn hàng ID: {data.chi_tiet_don_hang_id}, don_hang_id: {order_detail.don_hang_id}")

            # 2. Kiểm tra quyền sở hữu
            if order_detail.don_hang.nguoi_dung_id != user_id:
                logger.warning(
                    f"Quyền truy cập bị từ chối | user_id: {user_id}, "
                    f"owner_id: {order_detail.don_hang.nguoi_dung_id}"
                )
                raise PermissionDeniedError("Bạn không có quyền đánh giá chi tiết đơn hàng này.")

            # 3. Kiểm tra đã đánh giá chưa
            existing_review = db.session.query(DanhGia.id).filter_by(
                chi_tiet_don_hang_id=data.chi_tiet_don_hang_id
            ).first()
            if existing_review:
                logger.warning(f"Đã tồn tại đánh giá cho chi_tiet_don_hang_id: {data.chi_tiet_don_hang_id}")
                raise AlreadyReviewedError("Bạn đã đánh giá chi tiết đơn hàng này rồi.")

            # 4. Tạo đánh giá mới
            new_review = DanhGia(
                chi_tiet_don_hang_id=data.chi_tiet_don_hang_id,
                diem_danh_gia=data.diem_danh_gia,
                binh_luan=data.binh_luan,
                nguoi_dung_id=user_id,
                san_pham_id=order_detail.san_pham_id,
                trang_thai=TrangThaiDanhGia.DA_DUYET  # Mặc định duyệt ngay
            )
            db.session.add(new_review)
            db.session.flush()  # Để lấy ID

            logger.info(f"Tạo đánh giá thành công | review_id: {new_review.id}, diem: {data.diem_danh_gia}")
            return new_review

        except (InvalidDataError, PermissionDeniedError, AlreadyReviewedError):
            raise  # Để route xử lý lỗi
        except Exception as e:
            logger.error(f"Lỗi khi tạo đánh giá: {e}", exc_info=True)
            raise ReviewError("Lỗi hệ thống khi tạo đánh giá")

    @staticmethod
    def update_review_status(review_id: int, data: DanhGiaUpdate) -> DanhGia:
        """
        (Admin) Cập nhật trạng thái của một đánh giá.
        """
        logger.info(f"PUT /danh-gia/{review_id}/status | Cập nhật trạng thái | new_status: {data.trang_thai}")

        try:
            review = db.session.get(DanhGia, review_id)
            if not review:
                logger.warning(f"Không tìm thấy đánh giá ID: {review_id}")
                raise ReviewError(f"Không tìm thấy đánh giá với ID {review_id}")

            old_status = review.trang_thai
            review.trang_thai = data.trang_thai

            logger.info(
                f"Cập nhật trạng thái đánh giá thành công | "
                f"review_id: {review_id}, {old_status} → {data.trang_thai}"
            )
            return review

        except ReviewError:
            raise
        except Exception as e:
            logger.error(f"Lỗi khi cập nhật trạng thái đánh giá {review_id}: {e}", exc_info=True)
            raise ReviewError("Lỗi hệ thống khi cập nhật trạng thái đánh giá")