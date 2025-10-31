from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

from .ChiTietDonHang import ChiTietDonHangResponse

class GioHangBase(BaseModel):
    """Schema cơ sở cho giỏ hàng."""
    nguoi_dung_id: int = Field(..., description="ID của người dùng sở hữu giỏ hàng")
    don_hang_id: Optional[int] = Field(None, description="ID của đơn hàng liên kết")

class GioHangResponse(GioHangBase):
    id: int
    ngay_tao: datetime
    ngay_cap_nhat: datetime
    chi_tiet_gio_hangs: List[ChiTietDonHangResponse] = []

    class Config:
        orm_mode = True

class GioHangPublic(GioHangResponse):
    """Schema công khai cho giỏ hàng, có thể thêm các trường tính toán ở đây."""
    tong_so_luong: Optional[int] = Field(0, description="Tổng số lượng sản phẩm trong giỏ hàng")
    tong_gia_tri: Optional[float] = Field(0.0, description="Tổng giá trị của giỏ hàng")
    class Config:
        orm_mode = True