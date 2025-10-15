import enum
from typing import List, TypeVar, Generic
from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

# Dùng lại cho tất cả các loại phân trang
ItemType = TypeVar('ItemType')

# --- ENUMS CHO SẢN PHẨM ---
class TrangThaiSanPhamEnum(str, enum.Enum):
    DANG_BAN = 'đang bán'
    AN = 'ẩn'
    HET_HANG = 'hết hàng'

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

# --- ENUMS CHO ĐƠN HÀNG (MỚI) ---
class TrangThaiDonHangEnum(str, enum.Enum):
    CHO_XAC_NHAN = "cho_xac_nhan"
    DA_XAC_NHAN = "da_xac_nhan"
    DANG_GIAO_HANG = "dang_giao_hang"
    HOAN_THANH = "hoan_thanh"
    DA_HUY = "da_huy"
    YEU_CAU_TRA_HANG = "yeu_cau_tra_hang"
    DA_TRA_HANG = "da_tra_hang"

# --- ENUMS CHO THANH TOÁN (MỚI) ---
class TrangThaiThanhToanEnum(str, enum.Enum):
    CHO_THANH_TOAN = 'cho_thanh_toan'
    DA_THANH_TOAN = 'da_thanh_toan'
    THAT_BAI = 'that_bai'
    DA_HOAN_TIEN = 'da_hoan_tien'

class PhuongThucThanhToanEnum(str, enum.Enum):
    COD = 'cod'
    CHUYEN_KHOAN = 'chuyen_khoan'
    VNPAY = 'vnpay'

# --- SCHEMA PHÂN TRANG CHUNG ---
class PaginatedResponse(GenericModel, Generic[ItemType]):
    total: int = Field(..., description="Tổng số lượng items")
    page: int = Field(..., description="Trang hiện tại")
    size: int = Field(..., description="Số lượng items trên mỗi trang")
    items: List[ItemType] = Field(..., description="Danh sách các items")