# /backend/app/schemas/DiaChi.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# ==============================================================
# Schema cơ bản cho Địa chỉ
# ==============================================================
class DiaChiBase(BaseModel):
    ten_nguoi_nhan: str = Field(..., max_length=100, description="Họ tên người nhận hàng")
    so_dien_thoai: str = Field(..., max_length=15, description="Số điện thoại người nhận")
    dia_chi_cu_the: str = Field(..., max_length=255, description="Số nhà, tên đường")
    phuong_xa: str = Field(..., max_length=100, description="Phường / Xã")
    tinh_thanh: str = Field(..., max_length=100, description="Tỉnh / Thành phố")
    ma_buu_dien: Optional[str] = Field(None, max_length=20, description="Mã bưu điện (nếu có)")
    la_mac_dinh: bool = Field(False, description="Có phải địa chỉ mặc định không?")


class DiaChiCreate(DiaChiBase):
    pass


class DiaChiUpdate(BaseModel):
    ten_nguoi_nhan: Optional[str] = Field(None, max_length=100)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    dia_chi_cu_the: Optional[str] = Field(None, max_length=255)
    phuong_xa: Optional[str] = Field(None, max_length=100)
    tinh_thanh: Optional[str] = Field(None, max_length=100)
    ma_buu_dien: Optional[str] = Field(None, max_length=20)
    la_mac_dinh: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)


class DiaChiResponse(DiaChiBase):
    id: int
    nguoi_dung_id: int
    ngay_tao: datetime
    ngay_cap_nhat: datetime

    model_config = ConfigDict(from_attributes=True)


# ==============================================================
# Schema cho Response phân trang và danh sách
# ==============================================================
class PaginationInfo(BaseModel):
    """Schema thông tin phân trang"""
    page: int = Field(..., description="Trang hiện tại")
    per_page: int = Field(..., description="Số lượng mỗi trang")
    total: int = Field(..., description="Tổng số bản ghi")
    pages: int = Field(..., description="Tổng số trang")

    model_config = ConfigDict(from_attributes=True)


class DiaChiListResponse(BaseModel):
    """Schema response cho danh sách địa chỉ có phân trang"""
    data: List[DiaChiResponse] = Field(..., description="Danh sách địa chỉ")
    pagination: PaginationInfo = Field(..., description="Thông tin phân trang")

    model_config = ConfigDict(from_attributes=True)


class DeleteResponse(BaseModel):
    """Schema response cho xóa thành công"""
    message: str = Field(..., description="Thông báo kết quả")

    model_config = ConfigDict(from_attributes=True)


class ErrorResponse(BaseModel):
    """Schema response cho lỗi"""
    error: str = Field(..., description="Thông báo lỗi")
    chi_tiet: Optional[str] = Field(None, description="Chi tiết lỗi (nếu có)")

    model_config = ConfigDict(from_attributes=True)


# ==============================================================
# Schema cho Path Parameters
# ==============================================================
class DiaChiPath(BaseModel):
    """Schema cho path parameter địa chỉ ID"""
    dia_chi_id: int = Field(..., description="ID của địa chỉ")

    model_config = ConfigDict(from_attributes=True)


# ==============================================================
# Schema cho các trường hợp đặc biệt
# ==============================================================
class DiaChiMacDinhResponse(BaseModel):
    """Schema response khi đặt địa chỉ làm mặc định"""
    id: int = Field(..., description="ID địa chỉ")
    la_mac_dinh: bool = Field(..., description="Trạng thái mặc định")
    message: str = Field(..., description="Thông báo")

    model_config = ConfigDict(from_attributes=True)


class DiaChiCountResponse(BaseModel):
    """Schema response cho số lượng địa chỉ"""
    total: int = Field(..., description="Tổng số địa chỉ")
    mac_dinh: int = Field(..., description="Số địa chỉ mặc định")

    model_config = ConfigDict(from_attributes=True)