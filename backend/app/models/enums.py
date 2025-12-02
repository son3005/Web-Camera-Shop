import enum

# --- ENUMS CHO SẢN PHẨM ---
class TrangThaiSanPhamEnum(str, enum.Enum):
    """
    Enum biểu diễn trạng thái bán của sản phẩm.

    Thành viên:
    - DANG_BAN ('dang_ban'): Sản phẩm đang được hiển thị và có thể đặt mua.
    - SAP_BAN ('sap_ban'): Sản phẩm sắp được bán, có thể hiển thị nhưng chưa cho phép đặt mua.
    - NGUNG_BAN ('ngung_ban'): Sản phẩm ngừng bán/ẩn khỏi cửa hàng, không cho phép đặt mua.

    Ghi chú:
    Kế thừa từ `str` để thuận tiện cho lưu trữ và trao đổi dữ liệu (ví dụ: DB, JSON)
    và cho phép so sánh trực tiếp với giá trị chuỗi.
    """
    DANG_BAN = 'dang_ban'
    SAP_BAN = 'sap_ban'
    NGUNG_BAN = 'ngung_ban'

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
    CHO_XAC_NHAN = "cho_xac_nhan"
    DA_XAC_NHAN = "da_xac_nhan"
    DANG_GIAO = "dang_giao"
    DA_GIAO = "da_giao"
    DA_HUY = "da_huy"
    YEU_CAU_DOI_TRA = "yeu_cau_doi_tra"
    CHAP_NHAN_DOI_TRA = "chap_nhan_doi_tra"
    TU_CHOI_DOI_TRA = "tu_choi_doi_tra"
    DA_HOAN_TIEN = "da_hoan_tien"




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
    - PAYOS_QR: Thanh toán qua mã QR của PayOS.

    Đặc điểm:
    - Kế thừa từ str để dễ lưu trữ/so sánh và tuần tự hóa (DB/JSON).
    - Tương thích tốt với Pydantic/FastAPI cho mục đích validate và sinh schema.
    """
    COD = 'cod' 
    PAYOS_QR = 'payos_qr'

class TrangThaiNhaCungCapEnum(str, enum.Enum):
    KICH_HOAT = 'kich_hoat'
    NGUNG_HOAT_DONG = 'ngung_hoat_dong'

class   TrangThaiAnhTrinhChieuEnum(str, enum.Enum):
    HIEU_LUC = 'hieu_luc'
    KHONG_HIEU_LUC = 'khong_hieu_luc'