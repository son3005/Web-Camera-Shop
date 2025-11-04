# /backend/app/schemas/BienTheSanPham.py
from pydantic import BaseModel, Field, ConfigDict, validator
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from .HinhAnhSanPham import HinhAnhResponse, HinhAnhCreate
from ..Shared import TrangThaiSanPhamEnum


class BienTheSanPhamBase(BaseModel):
    san_pham_id: Optional[int] = Field(None, description="ID của sản phẩm cha")
    ten_bien_the: Optional[str] = Field(None, max_length=100, description="Tên biến thể sản phẩm")
    trang_thai_kich_hoat: Optional[TrangThaiSanPhamEnum] = Field(
        TrangThaiSanPhamEnum.DANG_BAN,
        description="Trạng thái kích hoạt của biến thể sản phẩm"
    )
    gia_ban: Decimal = Field(..., gt=0, description="Giá bán của biến thể sản phẩm")
    mau: Optional[str] = Field(None,max_length=20, description="Màu của biến thể")

class BienTheSanPhamCreate(BienTheSanPhamBase):
    hinh_anhs: Optional[List[HinhAnhCreate]] = Field(
        [], description="Danh sách ảnh của biến thể"
    )


class BienTheSanPhamUpdate(BaseModel):
    ten_bien_the: Optional[str] = Field(None, max_length=100)
    trang_thai_kich_hoat: Optional[TrangThaiSanPhamEnum] = None
    gia_ban: Optional[Decimal] = Field(None, gt=0)
    mau: Optional[str] = Field(None,max_length=20)
    new_hinh_anhs: Optional[List[HinhAnhCreate]] = Field([], description="Ảnh mới")
    deleted_hinh_anh_ids: Optional[List[int]] = Field([], description="ID ảnh xóa")

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)  # Sửa: thêm use_enum_values


class BienTheSanPhamDelete(BaseModel):
    id: int


class BienTheSanPhamResponse(BienTheSanPhamBase):
    id: int
    so_luong: int
    hinh_anhs: List[HinhAnhResponse] = Field(
        default_factory=list,
        description="Danh sách ảnh của biến thể"
    )

    model_config = ConfigDict(from_attributes=True)