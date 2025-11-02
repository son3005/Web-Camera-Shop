# /backend/app/services/donhang_service.py
from ..extensions import db
from sqlalchemy.orm import Session, joinedload, selectinload
# --- (THÊM) Import func để dùng count ---
from sqlalchemy import func, or_
from decimal import Decimal
import uuid # Để tạo mã đơn hàng
from typing import Dict, Any, List
from datetime import datetime, time # Thêm datetime, time để xử lý date range
import logging  # THÊM: Import logging

# THÊM: Logger riêng cho service
logger = logging.getLogger(__name__)

# Import Models
from ..models.giohang_dathang import GioHang, ChiTietGioHang, DonHang, ChiTietDonHang, ThanhToan
from ..models.sanpham import BienTheSanPham, SanPham
from ..models.nguoidung import DiaChi, NguoiDung
# --- Import Enum từ file mới ---
from ..models.enums import TrangThaiDonHangEnum, TrangThaiThanhToanEnum, PhuongThucThanhToanEnum

# Import Schemas (Sửa đường dẫn nếu cần)
from ..schemas.giohang_dathang import DonHangCreate, DonHangUpdate

# Import lỗi từ các service khác
from .giohang_service import VariantNotFound, OutOfStockError, CartItemNotFoundError

# --- Định nghĩa lỗi nghiệp vụ (Giữ nguyên) ---

class ServiceError(Exception):
    """Lỗi nghiệp vụ chung"""
    pass

class CartIsEmptyError(ServiceError):
    """Giỏ hàng rỗng"""
    pass

class AddressNotFoundError(ServiceError):
    """Địa chỉ không hợp lệ"""
    pass

class OrderNotFoundError(ServiceError):
    """Không tìm thấy đơn hàng"""
    pass

class PermissionDeniedError(ServiceError):
    """Không có quyền thực hiện hành động"""
    pass


class DonHangService:
    """
    Lớp Service chứa toàn bộ logic nghiệp vụ cho việc quản lý Đơn hàng.
    Service không bao giờ gọi db.session.commit().
    """

    @staticmethod
    def create_order_from_cart(user_id: int, data: DonHangCreate) -> DonHang:
        """
        Nghiệp vụ cốt lõi: Tạo đơn hàng từ giỏ hàng của người dùng.
        """
        logger.info(f"Bắt đầu tạo đơn hàng từ giỏ hàng cho user_id: {user_id}")  # THÊM: Log bắt đầu hàm

        cart = GioHang.query.options(
            selectinload(GioHang.items).options(
                joinedload(ChiTietGioHang.bien_the).options(
                    joinedload(BienTheSanPham.san_pham)
                )
            )
        ).filter_by(nguoi_dung_id=user_id).first()

        if not cart or not cart.items:
            logger.warning(f"Giỏ hàng rỗng cho user_id: {user_id}")  # THÊM: Log cảnh báo
            raise CartIsEmptyError("Giỏ hàng của bạn đang trống.")

        address = DiaChi.query.filter_by(id=data.dia_chi_id, nguoi_dung_id=user_id).first()
        if not address:
            logger.warning(f"Địa chỉ không tồn tại cho user_id: {user_id}, dia_chi_id: {data.dia_chi_id}")  # THÊM: Log cảnh báo
            raise AddressNotFoundError("Địa chỉ không hợp lệ.")

        # Tính tổng tiền và tạo mã đơn hàng
        tong_tien = Decimal('0')
        for item in cart.items:
            gia_hieu_qua = item.bien_the.gia_khuyen_mai if item.bien_the.gia_khuyen_mai else item.bien_the.gia_ban
            tong_tien += gia_hieu_qua * item.so_luong

        ma_don_hang = f"DH-{uuid.uuid4().hex[:8].upper()}"

        # Tạo đơn hàng mới
        new_order = DonHang(
            nguoi_dung_id=user_id,
            ma_don_hang=ma_don_hang,
            ten_nguoi_nhan=address.ten_nguoi_nhan,
            so_dien_thoai_nhan=address.so_dien_thoai,
            dia_chi_giao=address.dia_chi,
            tong_tien=tong_tien,
            trang_thai=TrangThaiDonHangEnum.DANG_XU_LY,
            ghi_chu=data.ghi_chu
        )
        db.session.add(new_order)
        db.session.flush()

        # Tạo chi tiết đơn hàng từ giỏ hàng
        for item in cart.items:
            chi_tiet = ChiTietDonHang(
                don_hang_id=new_order.id,
                bien_the_san_pham_id=item.bien_the_san_pham_id,
                so_luong=item.so_luong,
                gia_luc_mua=item.bien_the.gia_ban  # Giả sử, bạn có thể điều chỉnh
            )
            db.session.add(chi_tiet)
            # Giảm tồn kho
            item.bien_the.so_luong_ton -= item.so_luong

        # Tạo thanh toán
        thanh_toan = ThanhToan(
            don_hang_id=new_order.id,
            so_tien= tong_tien,
            phuong_thuc=PhuongThucThanhToanEnum.CASH,  # Giả sử
            trang_thai=TrangThaiThanhToanEnum.CHUA_THANH_TOAN
        )
        db.session.add(thanh_toan)

        # Xóa giỏ hàng sau khi tạo đơn
        for item in cart.items:
            db.session.delete(item)
        db.session.delete(cart)

        logger.info(f"Tạo đơn hàng thành công cho user_id: {user_id}, order_id: {new_order.id}")  # THÊM: Log thành công
        return new_order

    @staticmethod
    def get_order_by_id(order_id: int) -> DonHang:
        """
        Lấy đơn hàng theo ID với chi tiết.
        """
        logger.info(f"Bắt đầu lấy đơn hàng với order_id: {order_id}")  # THÊM: Log bắt đầu hàm

        order = DonHang.query.options(
            selectinload(DonHang.chi_tiet_don_hangs),
            joinedload(DonHang.thanh_toan)
        ).get(order_id)

        if not order:
            logger.warning(f"Không tìm thấy đơn hàng với order_id: {order_id}")  # THÊM: Log cảnh báo
            raise OrderNotFoundError("Không tìm thấy đơn hàng.")

        logger.info(f"Lấy đơn hàng thành công cho order_id: {order_id}")  # THÊM: Log thành công
        return order

    @staticmethod
    def update_order(order_id: int, data: DonHangUpdate) -> DonHang:
        """
        Cập nhật trạng thái đơn hàng (Admin).
        """
        logger.info(f"Bắt đầu cập nhật đơn hàng với order_id: {order_id}")  # THÊM: Log bắt đầu hàm

        order = DonHangService.get_order_by_id(order_id)

        if data.trang_thai:
            order.trang_thai = data.trang_thai

        logger.info(f"Cập nhật đơn hàng thành công cho order_id: {order_id}")  # THÊM: Log thành công
        return order

    @staticmethod
    def get_orders_by_user(user_id: int, page: int, per_page: int) -> List[DonHang]:
        """
        Lấy danh sách đơn hàng của user.
        """
        logger.info(f"Bắt đầu lấy danh sách đơn hàng cho user_id: {user_id}, page: {page}")  # THÊM: Log bắt đầu hàm

        query = DonHang.query.options(
            selectinload(DonHang.chi_tiet_don_hangs),
            joinedload(DonHang.thanh_toan)
        ).filter_by(nguoi_dung_id=user_id).order_by(DonHang.ngay_tao.desc())

        paginated_orders = query.paginate(page=page, per_page=per_page, error_out=False)
        logger.info(f"Lấy danh sách đơn hàng thành công cho user_id: {user_id}, total: {paginated_orders.total}")  # THÊM: Log thành công
        return paginated_orders

    @staticmethod
    def get_all_orders(page: int, per_page: int, search: str = None, status: str = None, sort_by: str = 'date', sort_order: str = 'desc') -> List[DonHang]:
        """
        (Admin) Lấy tất cả đơn hàng với filter, search, sort.
        """
        logger.info(f"Bắt đầu lấy tất cả đơn hàng, page: {page}, search: {search}, status: {status}, sort_by: {sort_by}")  # THÊM: Log bắt đầu hàm với params

        query = DonHang.query.options(
            selectinload(DonHang.chi_tiet_don_hangs),
            joinedload(DonHang.thanh_toan)
        )

        if status:
            logger.debug(f"Lọc theo trạng thái: {status}")
            query = query.filter(DonHang.trang_thai == status)

        if search:
            logger.debug(f"Tìm kiếm với: {search}")
            query = query.filter(
                or_(
                    DonHang.ma_don_hang.ilike(f"%{search}%"),
                    DonHang.so_dien_thoai_nhan.ilike(f"%{search}%"),
                    DonHang.ten_nguoi_nhan.ilike(f"%{search}%")
                )
            )

        sort_direction = 'desc' if sort_order.lower() not in ['asc', 'desc'] else sort_order.lower()

        if sort_by == 'price':
            order_field = DonHang.tong_tien.asc() if sort_direction == 'asc' else DonHang.tong_tien.desc()
        else:
            order_field = DonHang.ngay_tao.asc() if sort_direction == 'asc' else DonHang.ngay_tao.desc()

        logger.debug(f"Sắp xếp theo: {sort_by} {sort_direction}")
        query = query.order_by(order_field)

        paginated_result = query.paginate(page=page, per_page=per_page, error_out=False)
        logger.info(f"Lấy tất cả đơn hàng thành công, total: {paginated_result.total}")  # THÊM: Log thành công
        return paginated_result

    @staticmethod
    def get_order_summary_by_status() -> Dict[str, int]:
        """
        (Admin) Lấy tổng số đơn hàng theo từng trạng thái.
        """
        logger.info("Bắt đầu lấy summary đơn hàng theo trạng thái")  # THÊM: Log bắt đầu hàm

        try:
            status_counts_query = db.session.query(
                DonHang.trang_thai,
                func.count(DonHang.id)
            ).group_by(DonHang.trang_thai).all()

            summary = {status.value: count for status, count in status_counts_query}

            all_statuses = [status.value for status in TrangThaiDonHangEnum]
            for status_key in all_statuses:
                summary.setdefault(status_key, 0)

            total_orders = sum(summary.values())
            summary['Total'] = total_orders

            logger.info("Lấy summary thành công")  # THÊM: Log thành công
            return summary

        except Exception as e:
            logger.error(f"Lỗi khi lấy thống kê đơn hàng theo trạng thái: {str(e)}", exc_info=True)  # THÊM: Log lỗi với chi tiết
            # Trả về dict rỗng nếu có lỗi để tránh crash frontend
            return {}