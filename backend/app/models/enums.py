import enum

# --- ENUMS CHO SẢN PHẨM ---
class TrangThaiSanPhamEnum(str, enum.Enum):
    DANG_BAN = 'đang bán'
    AN = 'ẩn'
    HET_HANG = 'hết hàng'

# --- ENUMS CHO ĐÁNH GIÁ (Lấy từ file sanpham.py của bạn) ---
class TrangThaiDanhGia(str, enum.Enum):
    CHO_DUYET = 'cho_duyet'
    DA_DUYET = 'da_duyet'
    BI_TU_CHOI = 'bi_tu_choi'

# --- ENUMS CHO NGƯỜI DÙNG ---
class VaiTroNguoiDungEnum(str, enum.Enum):
    KHACH_HANG = 'khach_hang'
    QUAN_TRI_VIEN = 'quan_tri_vien'

class TrangThaiNguoiDungEnum(str, enum.Enum):
    KICH_HOAT = 'kich_hoat'
    KHOA = 'khoa'
    
class GioiTinhEnum(str, enum.Enum):
    NAM = 'nam'
    NU = 'nu'
    KHAC = 'khac'

# --- ENUMS CHO ĐƠN HÀNG ---
class TrangThaiDonHangEnum(str, enum.Enum):
    CHO_XAC_NHAN = "cho_xac_nhan"
    DA_XAC_NHAN = "da_xac_nhan"
    DANG_GIAO_HANG = "dang_giao_hang"
    HOAN_THANH = "hoan_thanh" # Đã giao hàng thành công
    DA_HUY = "da_huy"
    YEU_CAU_TRA_HANG = "yeu_cau_tra_hang"
    DA_TRA_HANG = "da_tra_hang"

# --- ENUMS CHO THANH TOÁN ---
class TrangThaiThanhToanEnum(str, enum.Enum):
    CHO_THANH_TOAN = 'cho_thanh_toan' # Đơn hàng đã tạo, chờ thanh toán (VD: Chờ quét QR)
    DA_THANH_TOAN = 'da_thanh_toan'
    THAT_BAI = 'that_bai'
    DA_HOAN_TIEN = 'da_hoan_tien'

class PhuongThucThanhToanEnum(str, enum.Enum):
    COD = 'cod' # Trả tiền khi nhận hàng
    VNPAY_QR = 'vnpay_qr'
    VNPAY_EWALLET = 'vnpay_ewallet'
    KHAC = 'khac'