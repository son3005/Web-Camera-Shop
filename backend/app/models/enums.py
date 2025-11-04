import enum

# --- ENUMS CHO SẢN PHẨM ---
class TrangThaiSanPhamEnum(str, enum.Enum):
    """
    Enum biểu diễn trạng thái bán của sản phẩm.

    Thành viên:
    - DANG_BAN ('dang_ban'): Sản phẩm đang được hiển thị và có thể đặt mua.
    - AN ('ngung_ban'): Sản phẩm ngừng bán/ẩn khỏi cửa hàng, không cho phép đặt mua.

    Ghi chú:
    Kế thừa từ `str` để thuận tiện cho lưu trữ và trao đổi dữ liệu (ví dụ: DB, JSON)
    và cho phép so sánh trực tiếp với giá trị chuỗi.
    """
    DANG_BAN = 'dang_ban'
    AN = 'ngung_ban'

# --- ENUMS CHO ĐÁNH GIÁ (Lấy từ file sanpham.py của bạn) ---
class TrangThaiDanhGiaEnum(str, enum.Enum):
    DA_DUYET = 'da_duyet'
    BI_TU_CHOI = 'bi_tu_choi'

# --- ENUMS CHO NGƯỜI DÙNG ---
class VaiTroNguoiDungEnum(str, enum.Enum):
    KHACH_HANG = 'khach_hang'
    QUAN_TRI_VIEN = 'quan_tri_vien'

class TrangThaiNguoiDungEnum(str, enum.Enum):
    KICH_HOAT = 'kich_hoat'
    KHOA = 'khoa'
    

# --- ENUMS CHO ĐƠN HÀNG ---
class TrangThaiDonHangEnum(str, enum.Enum):
    """
    Enum định nghĩa các trạng thái của đơn hàng trong hệ thống.

    Attributes:
        CHO_XAC_NHAN: Đơn hàng đang chờ xác nhận từ người bán
        DA_XAC_NHAN: Đơn hàng đã được xác nhận và đang chuẩn bị
        DANG_GIAO_HANG: Đơn hàng đang trong quá trình vận chuyển
        HOAN_THANH: Đơn hàng đã được giao thành công cho khách hàng
        DA_HUY: Đơn hàng đã bị hủy bởi người mua hoặc người bán
        YEU_CAU_TRA_HANG: Khách hàng yêu cầu trả lại hàng
        DA_TRA_HANG: Đơn hàng đã được trả lại và xử lý hoàn tất
    """
    CHO_XAC_NHAN = "cho_xac_nhan"
    DA_XAC_NHAN = "da_xac_nhan"
    DANG_GIAO_HANG = "dang_giao_hang"
    HOAN_THANH = "hoan_thanh" # Đã giao hàng thành công
    DA_HUY = "da_huy"
    YEU_CAU_TRA_HANG = "yeu_cau_tra_hang"
    DA_TRA_HANG = "da_tra_hang"

# --- ENUMS CHO THANH TOÁN ---
class TrangThaiThanhToanEnum(str, enum.Enum):
    """
    Enum biểu diễn các trạng thái thanh toán của đơn hàng/giao dịch trong hệ thống.

    Giá trị:
    - CHO_THANH_TOAN: Đang chờ người dùng/đối tác thực hiện thanh toán.
    - DA_THANH_TOAN: Thanh toán đã được thực hiện thành công.
    - THAT_BAI: Thanh toán không thành công (bị từ chối, lỗi hệ thống, hoặc hết hạn).
    - DA_HOAN_TIEN: Giao dịch đã được hoàn tiền một phần hoặc toàn bộ.

    Đặc điểm:
    - Kế thừa từ str để dễ dàng lưu trữ/so sánh và tuần tự hóa (ví dụ JSON).
    - Tương thích tốt với Pydantic/FastAPI cho mục đích validate và sinh schema.
    """
    CHO_THANH_TOAN = 'cho_thanh_toan'
    DA_THANH_TOAN = 'da_thanh_toan'
    THAT_BAI = 'that_bai'
    DA_HOAN_TIEN = 'da_hoan_tien'

class PhuongThucThanhToanEnum(str, enum.Enum):
    """
    Enum biểu diễn các phương thức thanh toán được hỗ trợ trong hệ thống.

    Giá trị:
    - COD: Thanh toán khi nhận hàng (Cash on Delivery).
    - VNPAY_QR: Thanh toán qua mã QR của VNPay.
    - VNPAY_EWALLET: Thanh toán bằng ví điện tử VNPay.
    - KHAC: Phương thức khác (dùng cho các tích hợp mở rộng).

    Đặc điểm:
    - Kế thừa từ str để dễ lưu trữ/so sánh và tuần tự hóa (DB/JSON).
    - Tương thích tốt với Pydantic/FastAPI cho mục đích validate và sinh schema.
    """
    COD = 'cod'  # Trả tiền khi nhận hàng
    VNPAY_QR = 'vnpay_qr'
    VNPAY_EWALLET = 'vnpay_ewallet'
    KHAC = 'khac'
