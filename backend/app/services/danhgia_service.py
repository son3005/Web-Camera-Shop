# /backend/app/services/danhgia_service.py
from ..extensions import db
from sqlalchemy.orm import joinedload
from typing import List

# đường dẫn import models
from ..models.extras import DanhGia, TrangThaiDanhGia
from ..models.sanpham import SanPham
from ..models.giohang_dathang import ChiTietDonHang 

# Import lỗi tùy chỉnh từ sanpham_service
from .sanpham_service import SanPhamService, ProductNotFound

# đường dẫn import schemas
from ..schemas.extras import DanhGiaCreate, DanhGiaUpdate

# Các lỗi nghiệp vụ
class ProductNotFound(Exception):
    pass
class ReviewError(Exception):
    pass
class PermissionDeniedError(ReviewError):
    pass
class AlreadyReviewedError(ReviewError):
    pass
class OrderNotCompletedError(ReviewError):
    pass
class InvalidDataError(ReviewError):
    pass

class DanhGiaService:

    @staticmethod
    def get_reviews_for_product(product_id: int, page: int, per_page: int):
        """
        Lấy danh sách đánh giá (có phân trang) cho một sản phẩm.
        Chỉ trả về các đánh giá 'DA_DUYET'.
        """
        # 1. Dùng service đã có
        product = SanPhamService.get_product_by_id(product_id)
        
        # 2. Lấy query từ 'danh_gias'
        reviews_query = product.danh_gias
        
        # 3. Lọc theo trạng thái
        reviews_query = reviews_query.filter(
            DanhGia.trang_thai == TrangThaiDanhGia.DA_DUYET
        )

        # 4. Tải sẵn thông tin người dùng
        reviews_query = reviews_query.options(
            joinedload(DanhGia.nguoi_dung)
        )

        # 5. Sắp xếp và phân trang
        return reviews_query.order_by(DanhGia.ngay_tao.desc()).paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )

    @staticmethod
    def create_review(user_id: int, data: DanhGiaCreate) -> DanhGia:
        """
        Tạo một đánh giá mới.
        """
        order_detail = db.session.get(ChiTietDonHang, data.chi_tiet_don_hang_id)
        
        if not order_detail:
            raise InvalidDataError("Không tìm thấy chi tiết đơn hàng.")

        # (BẢO MẬT) Kiểm tra chủ sở hữu
        if order_detail.don_hang.nguoi_dung_id != user_id:
            raise PermissionDeniedError("Bạn không có quyền đánh giá chi tiết đơn hàng này.")
            
        # (LOGIC) Kiểm tra đã đánh giá chưa
        existing_review = db.session.query(DanhGia.id).filter_by(chi_tiet_don_hang_id=data.chi_tiet_don_hang_id).first()
        if existing_review:
            raise AlreadyReviewedError("Bạn đã đánh giá chi tiết đơn hàng này rồi.")

        new_review = DanhGia(
            chi_tiet_don_hang_id=data.chi_tiet_don_hang_id,
            diem_danh_gia=data.diem_danh_gia,
            binh_luan=data.binh_luan,
            nguoi_dung_id=user_id,
            san_pham_id=order_detail.san_pham_id, 
            trang_thai=TrangThaiDanhGia.DA_DUYET # Mặc định
        )
        
        db.session.add(new_review)
        return new_review

    @staticmethod
    def update_review_status(review_id: int, data: DanhGiaUpdate) -> DanhGia:
        """
        (Admin) Cập nhật trạng thái của một đánh giá.
        """
        review = db.session.get(DanhGia, review_id)
        if not review:
            raise ReviewError(f"Không tìm thấy đánh giá với ID {review_id}")
            
        review.trang_thai = data.trang_thai
        return review