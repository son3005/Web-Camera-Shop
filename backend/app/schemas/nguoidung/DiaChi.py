from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DiaChiBase(BaseModel):
    ten_nguoi_nhan: str = Field(..., max_length=100, description="Họ tên người nhận hàng")
    so_dien_thoai: str = Field(..., max_length=15, description="Số điện thoại người nhận")
    dia_chi_cu_the: str = Field(..., max_length=255, description="Số nhà, tên đường")
    phuong_xa: str = Field(..., max_length=100, description="Phường / Xã")
    tinh_thanh: str = Field(..., max_length=100, description="Tỉnh / Thành phố")
    ma_buu_dien: Optional[str] = Field(None, max_length=20, description="Mã bưu điện (nếu có)")
    la_mac_dinh: bool = Field(False, description="Có phải địa chỉ mặc định không?")

class DiaChiCreate(DiaChiBase):
    # Khi tạo địa chỉ, ID người dùng sẽ được lấy từ token JWT,
    # không cần client phải gửi lên.
    pass

class DiaChiUpdate(BaseModel):
    # Tất cả các trường đều là Optional khi cập nhật
    ten_nguoi_nhan: Optional[str] = Field(None, max_length=100)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    dia_chi_cu_the: Optional[str] = Field(None, max_length=255)
    phuong_xa: Optional[str] = Field(None, max_length=100)
    tinh_thanh: Optional[str] = Field(None, max_length=100)
    ma_buu_dien: Optional[str] = Field(None, max_length=20)
    la_mac_dinh: Optional[bool] = None

class DiaChiResponse(DiaChiBase):
    id: int
    ngay_tao: datetime
    ngay_cap_nhat: datetime

    class Config:
        orm_mode = True