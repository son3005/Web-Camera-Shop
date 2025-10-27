# /backend/app/services/donhang_service.py
from app.extensions import db
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import func, or_ # Thêm 'or_' cho tìm kiếm
from decimal import Decimal
import uuid # Để tạo mã đơn hàng
from typing import Dict, Any, List
from datetime import datetime, time # Thêm datetime, time để xử lý date range

# Import Models
from app.models.giohang_dathang import GioHang, ChiTietGioHang, DonHang, ChiTietDonHang, ThanhToan
from app.models.sanpham import BienTheSanPham, SanPham
from app.models.nguoidung import DiaChi, NguoiDung
# --- Import Enum từ file mới ---
from app.models.enums import TrangThaiDonHangEnum, TrangThaiThanhToanEnum, PhuongThucThanhToanEnum

# Import Schemas
# (Sửa lại đường dẫn import schema DonHang cho đúng)
from app.schemas.giohang_dathang import DonHangCreate, DonHangUpdate

# Import lỗi từ các service khác
from app.services.giohang_service import VariantNotFound, OutOfStockError, CartItemNotFoundError

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
        Đây là một giao dịch (transaction) phức tạp.
        """

        # 1. Lấy giỏ hàng của người dùng (tải kèm biến thể và sản phẩm)
        cart = GioHang.query.options(
            selectinload(GioHang.items).options(
                joinedload(ChiTietGioHang.bien_the).options(
                    joinedload(BienTheSanPham.san_pham)
                )
            )
        ).filter_by(nguoi_dung_id=user_id).first()

        if not cart or not cart.items:
            raise CartIsEmptyError("Giỏ hàng của bạn đang trống.")

        # 2. Lấy địa chỉ giao hàng (và kiểm tra xem có thuộc user này không)
        address = DiaChi.query.filter_by(id=data.dia_chi_id, nguoi_dung_id=user_id).first()

        if not address:
            raise AddressNotFoundError("Địa chỉ giao hàng không hợp lệ.")

        # 3. KIỂM TRA TỒN KHO & KHÓA DATABASE (RẤT QUAN TRỌNG)
        variant_ids = [item.bien_the_san_pham_id for item in cart.items]
        variants = BienTheSanPham.query.filter(BienTheSanPham.id.in_(variant_ids)).with_for_update().all()
        variants_map = {v.id: v for v in variants}

        tam_tinh = Decimal(0)
        cac_chi_tiet_don_hang = []

        # 4. Tính toán giá trị đơn hàng và kiểm tra lại tồn kho
        for item in cart.items:
            variant = variants_map.get(item.bien_the_san_pham_id)

            if not variant:
                raise VariantNotFound(f"Sản phẩm ID {item.bien_the_san_pham_id} không còn tồn tại.")

            if variant.so_luong_ton < item.so_luong:
                raise OutOfStockError(f"Sản phẩm '{variant.san_pham.ten_san_pham}' không đủ hàng.")

            don_gia_luc_mua = variant.gia_khuyen_mai if variant.gia_khuyen_mai else variant.gia
            tam_tinh += (don_gia_luc_mua * item.so_luong)

            cac_chi_tiet_don_hang.append(
                ChiTietDonHang(
                    san_pham_id=variant.san_pham_id,
                    bien_the_id=variant.id,
                    sku_luc_mua=variant.ma_sku,
                    ten_san_pham_luc_mua=variant.san_pham.ten_san_pham,
                    ten_bien_the_luc_mua=variant.ten_bien_the,
                    don_gia_luc_mua=don_gia_luc_mua,
                    so_luong=item.so_luong
                )
            )

            # 5. TRỪ KHO
            variant.so_luong_ton -= item.so_luong

        # 6. Tạo Đơn hàng (DonHang)
        phi_van_chuyen = Decimal(0) # TODO: Logic tính phí vận chuyển
        tong_tien = tam_tinh + phi_van_chuyen

        new_order = DonHang(
            ma_don_hang=str(uuid.uuid4()).split('-')[-1].upper(),
            nguoi_dung_id=user_id,
            trang_thai=TrangThaiDonHangEnum.CHO_XAC_NHAN,
            ten_nguoi_nhan=address.ten_nguoi_nhan,
            so_dien_thoai_nhan=address.so_dien_thoai,
            dia_chi_giao_hang=address.get_full_address(),
            ghi_chu=data.ghi_chu,
            tam_tinh=tam_tinh,
            phi_van_chuyen=phi_van_chuyen,
            tong_tien=tong_tien,
        )

        new_order.cac_chi_tiet.extend(cac_chi_tiet_don_hang)

        # 7. Tạo Thanh toán (ThanhToan)
        new_payment = ThanhToan(
            so_tien=tong_tien,
            phuong_thuc=data.phuong_thuc_thanh_toan,
            trang_thai=TrangThaiThanhToanEnum.CHO_THANH_TOAN,
        )
        new_order.thanh_toan = new_payment

        # 8. XÓA GIỎ HÀNG
        ChiTietGioHang.query.filter_by(gio_hang_id=cart.id).delete()

        # 9. Thêm vào session
        db.session.add(new_order)
        # db.session.add(new_payment) # Không cần add thanh toán vì đã cascade

        return new_order

    @staticmethod
    def update_order_status(order_id: int, data: DonHangUpdate) -> DonHang:
        """
        (Admin) Cập nhật trạng thái đơn hàng.
        """
        order = db.session.get(DonHang, order_id)
        if not order:
            raise OrderNotFoundError("Không tìm thấy đơn hàng.")

        original_status = order.trang_thai
        try:
            new_status = TrangThaiDonHangEnum(data.trang_thai) # Validate enum
        except ValueError:
             raise ServiceError(f"Trạng thái '{data.trang_thai}' không hợp lệ.")


        if new_status == TrangThaiDonHangEnum.DA_HUY and original_status not in [TrangThaiDonHangEnum.DA_HUY, TrangThaiDonHangEnum.HOAN_THANH]:
            DonHangService._refund_stock_for_order(order)

        order.trang_thai = new_status
        return order

    @staticmethod
    def _refund_stock_for_order(order: DonHang):
        """
        (Internal) Hoàn lại số lượng tồn kho khi đơn hàng bị hủy.
        """
        variant_ids_to_refund = [item.bien_the_id for item in order.cac_chi_tiet]
        variants = BienTheSanPham.query.filter(BienTheSanPham.id.in_(variant_ids_to_refund)).with_for_update().all()
        variants_map = {v.id: v for v in variants}

        for item in order.cac_chi_tiet:
            if item.bien_the_id in variants_map:
                variants_map[item.bien_the_id].so_luong_ton += item.so_luong

        print(f"Đã hoàn kho cho đơn hàng {order.ma_don_hang}")


    # --- CÁC HÀM GET (Đọc dữ liệu) ---

    @staticmethod
    def get_order_details(order_id: int, user_id: int = None, is_admin: bool = False) -> DonHang:
        """
        Lấy chi tiết 1 đơn hàng.
        """
        order = DonHang.query.options(
            selectinload(DonHang.cac_chi_tiet),
            joinedload(DonHang.thanh_toan),
            joinedload(DonHang.nguoi_dung) # Cần cho Admin
        ).get(order_id)

        if not order:
            raise OrderNotFoundError("Không tìm thấy đơn hàng.")

        if not is_admin and (user_id is None or order.nguoi_dung_id != user_id):
            raise PermissionDeniedError("Bạn không có quyền xem đơn hàng này.")

        return order

    @staticmethod
    def get_orders_for_user(user_id: int, page: int, per_page: int):
        """
        Lấy lịch sử đơn hàng của người dùng (phân trang).
        """
        query = DonHang.query.filter_by(nguoi_dung_id=user_id)\
                .order_by(DonHang.ngay_tao.desc())

        paginated_result = query.paginate(page=page, per_page=per_page, error_out=False)
        return paginated_result

    # --- (ĐÂY LÀ PHƯƠNG THỨC ĐƯỢC CẬP NHẬT) ---
    @staticmethod
    def get_all_orders_admin(page: int, per_page: int, filters: Dict[str, Any] = None, sort_by: str = None, sort_order: str = 'desc'):
        """
        (Admin) Lấy tất cả đơn hàng, có bộ lọc, sắp xếp và phân trang nâng cao.
        """
        query = DonHang.query # Bắt đầu query

        # 1. Áp dụng Bộ lọc (Filters)
        if filters:
            # Lọc theo Trạng thái (có thể là nhiều trạng thái)
            if filters.get('trang_thai'):
                status_str = filters['trang_thai'] # Ví dụ: "CHO_XAC_NHAN,DA_XAC_NHAN"
                status_list = [s.strip() for s in status_str.split(',') if s.strip()]
                valid_statuses = []
                for s in status_list:
                    try:
                        valid_statuses.append(TrangThaiDonHangEnum(s))
                    except ValueError:
                        print(f"Cảnh báo: Trạng thái lọc '{s}' không hợp lệ.") # Log cảnh báo
                if valid_statuses:
                    query = query.filter(DonHang.trang_thai.in_(valid_statuses))

            # Lọc theo Ngày tạo (Date Range)
            start_date_str = filters.get('start_date')
            end_date_str = filters.get('end_date')
            if start_date_str:
                try:
                    start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                    # Lọc từ đầu ngày bắt đầu
                    query = query.filter(DonHang.ngay_tao >= datetime.combine(start_date, time.min))
                except ValueError:
                    print(f"Cảnh báo: start_date '{start_date_str}' không hợp lệ.")
            if end_date_str:
                try:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                    # Lọc đến cuối ngày kết thúc
                    query = query.filter(DonHang.ngay_tao <= datetime.combine(end_date, time.max))
                except ValueError:
                    print(f"Cảnh báo: end_date '{end_date_str}' không hợp lệ.")

            # Lọc theo Tìm kiếm (Search Term)
            if filters.get('search_term'):
                search = f"%{filters['search_term']}%"
                query = query.filter(
                    or_(
                        DonHang.ma_don_hang.ilike(search),
                        DonHang.so_dien_thoai_nhan.ilike(search),
                        DonHang.ten_nguoi_nhan.ilike(search) # Thêm tìm theo tên người nhận
                    )
                )

        # 2. Áp dụng Sắp xếp (Sort)
        order_field = None
        sort_direction = sort_order.lower()
        if sort_direction not in ['asc', 'desc']:
            sort_direction = 'desc' # Mặc định là desc nếu giá trị không hợp lệ

        if sort_by == 'price': # Sắp xếp theo Tổng tiền
            order_field = DonHang.tong_tien.asc() if sort_direction == 'asc' else DonHang.tong_tien.desc()
        # Mặc định hoặc nếu sort_by == 'date' (hoặc giá trị không hợp lệ khác)
        else:
            order_field = DonHang.ngay_tao.asc() if sort_direction == 'asc' else DonHang.ngay_tao.desc()

        query = query.order_by(order_field)

        # 3. Phân trang
        paginated_result = query.paginate(page=page, per_page=per_page, error_out=False)
        return paginated_result