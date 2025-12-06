# /backend/app/schemas/giohang/GioHang.py
from pydantic import BaseModel, Field, ConfigDict
from typing import List
from decimal import Decimal
from .ChiTietGioHang import ChiTietGioHangResponse


class GioHangBase(BaseModel):
    nguoi_dung_id: int = Field(..., description="ID người dùng")

    model_config = ConfigDict(from_attributes=True)


class GioHangResponse(GioHangBase):
    id: int = Field(..., description="ID giỏ hàng")
    items: List[ChiTietGioHangResponse] = Field(
        default_factory=list,
        description="Danh sách sản phẩm trong giỏ"
    )

    model_config = ConfigDict(from_attributes=True)


class GioHangPublic(GioHangResponse):
    tong_so_luong: int = Field(0, description="Tổng số lượng sản phẩm")
    tong_gia_tri: Decimal = Field(
        Decimal('0'),
        description="Tổng giá trị giỏ hàng"
    )

    model_config = ConfigDict(from_attributes=True)