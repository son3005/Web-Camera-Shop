from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


class ChiTietDonHangBase(BaseModel):
    ten_san_pham_luc_mua: str = Field(..., max_length=200)
    ten_bien_the_luc_mua: Optional[str] = Field(None, max_length=150)
    don_gia_luc_mua: Decimal = Field(..., ge=1)
    so_luong: int

    class Config:
        orm_mode = True

class ChiTietDonHangResponse(ChiTietDonHangBase):
    id: int
    ten_san_pham_luc_mua: str
    ten_bien_the_luc_mua: Optional[str]
    don_gia_luc_mua: Decimal
    so_luong: int

    class Config:
        orm_mode = True

class ChiTietDonHangCreate(ChiTietDonHangBase):
    """Schema dùng khi tạo mới chi tiết đơn hàng."""
    pass

class ChiTietDonHangUpdate(BaseModel):
    so_luong: Optional[int] = Field(None, ge=1)
    don_gia_luc_mua: Optional[Decimal] = Field(None, ge=0)


