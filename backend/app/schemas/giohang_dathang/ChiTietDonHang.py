# /backend/app/schemas/giohang_dathang/ChiTietDonHang.py
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from decimal import Decimal
from typing import Optional


class ChiTietDonHangBase(BaseModel):
    don_hang_id: int = Field(..., description="ID đơn hàng")
    bien_the_san_pham_id: Optional[int] = Field(None, description="ID biến thể sản phẩm")
    ten_san_pham_luc_mua: str = Field(..., max_length=255, description="Tên sản phẩm lúc mua")
    ten_bien_the_luc_mua: Optional[str] = Field(None, max_length=150, description="Tên biến thể lúc mua")
    don_gia_luc_mua: Decimal = Field(..., ge=0, description="Đơn giá lúc mua")
    so_luong: int = Field(..., ge=1, description="Số lượng")

    model_config = ConfigDict(from_attributes=True)


class ChiTietDonHangCreate(ChiTietDonHangBase):
    pass


class ChiTietDonHangUpdate(BaseModel):
    so_luong: Optional[int] = Field(None, ge=1)
    don_gia_luc_mua: Optional[Decimal] = Field(None, ge=0)

    model_config = ConfigDict(from_attributes=True)


class ChiTietDonHangResponse(ChiTietDonHangBase):
    id: int = Field(..., description="ID chi tiết đơn hàng")

    model_config = ConfigDict(from_attributes=True)