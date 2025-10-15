from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal

from ..Shared import TrangThaiThanhToanEnum, PhuongThucThanhToanEnum

class ThanhToanBase(BaseModel):
    """Schema cơ sở cho thanh toán."""
    so_tien: Decimal = Field(..., description="Số tiền thanh toán")
    phuong_thuc: PhuongThucThanhToanEnum = Field(..., description="Phương thức thanh toán đã chọn")
    trang_thai: TrangThaiThanhToanEnum = Field(..., description="Trạng thái của giao dịch thanh toán")
    ma_giao_dich_ben_thu_3: Optional[str] = Field(None, description="Mã giao dịch từ cổng thanh toán")

class ThanhToanResponse(ThanhToanBase):
    """Schema trả về thông tin chi tiết của thanh toán."""
    id: int
    don_hang_id: int
    ngay_tao: datetime
    ngay_cap_nhat: datetime

    class Config:
        orm_mode = True

class ThanhToanUpdate(BaseModel):
    """Schema dành cho admin hoặc webhook cập nhật trạng thái thanh toán."""
    trang_thai: TrangThaiThanhToanEnum
    ma_giao_dich_ben_thu_3: Optional[str] = None