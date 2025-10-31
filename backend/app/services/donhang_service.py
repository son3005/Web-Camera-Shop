# /backend/app/services/donhang_service.py
from ..extensions import db
from sqlalchemy.orm import Session, joinedload, selectinload
# --- (THÊM) Import func để dùng count ---
from sqlalchemy import func, or_
from decimal import Decimal
import uuid # Để tạo mã đơn hàng
from typing import Dict, Any, List
from datetime import datetime, time # Thêm datetime, time để xử lý date range

# Import Models
from ..models.giohang_dathang import GioHang, ChiTietGioHang, DonHang, ChiTietDonHang, ThanhToan
from ..models.sanpham import BienTheSanPham, SanPham
from ..models.nguoidung import DiaChi, NguoiDung
# --- Import Enum từ file mới ---
from ..models.enums import TrangThaiDonHangEnum, TrangThaiThanhToanEnum, PhuongThucThanhToanEnum

# Import Schemas (Sửa đường dẫn nếu cần)
from ..schemas.giohang_dathang import DonHangCreate, DonHangUpdate

# Import lỗi từ các service khác
from.giohang_service import VariantNotFound, OutOfStockError, CartItemNotFoundError

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
        # ... (Code create_order_from_cart của bạn giữ nguyên) ...
        cart = GioHang.query.options(
            selectinload(GioHang.items).options(
                joinedload(ChiTietGioHang.bien_the).options(
                    joinedload(BienTheSanPham.san_pham)
                )
            )
        ).filter_by(nguoi_dung_id=user_id).first()

        if not cart or not cart.items:
            raise CartIsEmptyError("Giỏ hàng của bạn đang trống.")

        address = DiaChi.query.filter_by(id=data.dia_chi_id, nguoi_dung_id=user_id).first()

        if not address:
            raise AddressNotFoundError("Địa chỉ giao hàng không hợp lệ.")

        variant_ids = [item.bien_the_san_pham_id for item in cart.items]
        variants = BienTheSanPham.query.filter(BienTheSanPham.id.in_(variant_ids)).with_for_update().all()
        variants_map = {v.id: v for v in variants}

        tam_tinh = Decimal(0)
        cac_chi_tiet_don_hang = []

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
            variant.so_luong_ton -= item.so_luong

        phi_van_chuyen = Decimal(0) # TODO: Logic tính phí vận chuyển
        tong_tien = tam_tinh + phi_van_chuyen

        new_order = DonHang(
            ma_don_hang=str(uuid.uuid4()).split('-')[-1].upper(),
            nguoi_dung_id=user_id,
            trang_thai=TrangThaiDonHangEnum.CHO_XAC_NHAN,
            ten_nguoi_nhan=address.ten_nguoi_nhan,
            so_dien_thoai_nhan=address.so_dien_thoai,
            # Sử dụng getattr để phòng trường hợp hàm không tồn tại
            dia_chi_giao_hang=getattr(address, 'get_full_address', lambda: f"{address.dia_chi_cu_the}, {address.phuong_xa}, {address.quan_huyen}, {address.tinh_thanh}")(),
            ghi_chu=data.ghi_chu,
            tam_tinh=tam_tinh,
            phi_van_chuyen=phi_van_chuyen,
            tong_tien=tong_tien,
        )

        new_order.cac_chi_tiet.extend(cac_chi_tiet_don_hang)

        new_payment = ThanhToan(
            so_tien=tong_tien,
            phuong_thuc=data.phuong_thuc_thanh_toan,
            trang_thai=TrangThaiThanhToanEnum.CHO_THANH_TOAN,
        )
        new_order.thanh_toan = new_payment

        ChiTietGioHang.query.filter_by(gio_hang_id=cart.id).delete()

        db.session.add(new_order)
        return new_order


    @staticmethod
    def update_order_status(order_id: int, data: DonHangUpdate) -> DonHang:
        """
        (Admin) Cập nhật trạng thái đơn hàng.
        """
        # ... (Code update_order_status của bạn giữ nguyên) ...
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
        # ... (Code _refund_stock_for_order của bạn giữ nguyên) ...
        variant_ids_quantities = {item.bien_the_id: item.so_luong for item in order.cac_chi_tiet}
        if not variant_ids_quantities:
            return

        variants = BienTheSanPham.query.filter(BienTheSanPham.id.in_(variant_ids_quantities.keys())).with_for_update().all()

        for variant in variants:
            if variant.id in variant_ids_quantities:
                variant.so_luong_ton += variant_ids_quantities[variant.id]

        print(f"Đã hoàn kho cho đơn hàng {order.ma_don_hang}")


    # --- CÁC HÀM GET (Đọc dữ liệu) ---

    @staticmethod
    def get_order_details(order_id: int, user_id: int = None, is_admin: bool = False) -> DonHang:
        """
        Lấy chi tiết 1 đơn hàng.
        """
        # ... (Code get_order_details của bạn giữ nguyên) ...
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
        # ... (Code get_orders_for_user của bạn giữ nguyên) ...
        query = DonHang.query.filter_by(nguoi_dung_id=user_id)\
                .order_by(DonHang.ngay_tao.desc())

        paginated_result = query.paginate(page=page, per_page=per_page, error_out=False)
        return paginated_result

    @staticmethod
    def get_all_orders_admin(page: int, per_page: int, filters: Dict[str, Any] = None, sort_by: str = None, sort_order: str = 'desc'):
        """
        (Admin) Lấy tất cả đơn hàng, có bộ lọc, sắp xếp và phân trang nâng cao.
        """
        # ... (Code get_all_orders_admin đã cập nhật ở lượt trước giữ nguyên) ...
        query = DonHang.query # Bắt đầu query

        # 1. Áp dụng Bộ lọc (Filters)
        if filters:
            # Lọc theo Trạng thái (có thể là nhiều trạng thái)
            if filters.get('trang_thai'):
                status_str = filters['trang_thai'] # Ví dụ: "CHO_XAC_NHAN,DA_XAC_NHAN"
                # Chuyển thành list enum hợp lệ
                status_list = [s.strip().lower() for s in status_str.split(',') if s.strip()] # Chuyển về lowercase
                valid_statuses = []
                for s in status_list:
                    try:
                        valid_statuses.append(TrangThaiDonHangEnum(s)) # Tạo enum từ lowercase
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
                    query = query.filter(DonHang.ngay_tao >= datetime.combine(start_date, time.min))
                except ValueError:
                    print(f"Cảnh báo: start_date '{start_date_str}' không hợp lệ.")
            if end_date_str:
                try:
                    end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
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
                        DonHang.ten_nguoi_nhan.ilike(search)
                    )
                )

        # 2. Áp dụng Sắp xếp (Sort)
        order_field = None
        sort_direction = sort_order.lower()
        if sort_direction not in ['asc', 'desc']:
            sort_direction = 'desc'

        if sort_by == 'price':
            order_field = DonHang.tong_tien.asc() if sort_direction == 'asc' else DonHang.tong_tien.desc()
        else:
            order_field = DonHang.ngay_tao.asc() if sort_direction == 'asc' else DonHang.ngay_tao.desc()

        query = query.order_by(order_field)

        # 3. Phân trang
        paginated_result = query.paginate(page=page, per_page=per_page, error_out=False)
        return paginated_result


    @staticmethod
    def get_order_summary_by_status() -> Dict[str, int]:
        """
        (Admin) Lấy tổng số đơn hàng theo từng trạng thái.
        Dùng cho component StatusGrid ở frontend.
        """
        try:
            # Query để đếm số lượng đơn hàng, nhóm theo trạng thái
            status_counts_query = db.session.query(
                DonHang.trang_thai,
                func.count(DonHang.id) # Đếm số lượng ID
            ).group_by(DonHang.trang_thai).all() # Nhóm theo trạng thái

            # Chuyển đổi kết quả thành dictionary dạng {'TEN_ENUM_STR': count}
            # Sử dụng .value để lấy giá trị string của Enum
            summary = {status.value: count for status, count in status_counts_query}

            # Đảm bảo tất cả các trạng thái enum đều có trong kết quả (với count = 0 nếu không có)
            all_statuses = [status.value for status in TrangThaiDonHangEnum]
            for status_key in all_statuses:
                summary.setdefault(status_key, 0) # Dùng setdefault cho gọn

            # Tính tổng số đơn hàng và thêm vào dict với key 'Total' (frontend cần key này)
            total_orders = sum(summary.values())
            summary['Total'] = total_orders

            return summary

        except Exception as e:
            print(f"Lỗi khi lấy thống kê đơn hàng theo trạng thái: {str(e)}")
            # Trả về dict rỗng nếu có lỗi để tránh crash frontend
            return {}
