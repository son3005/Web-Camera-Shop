# /backend/app/schemas/BienTheSanPham.py
from pydantic import BaseModel, Field, ConfigDict, validator
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from .HinhAnhSanPham import HinhAnhResponse, HinhAnhCreate, HinhAnhUpdate
from ..Shared import TrangThaiSanPhamEnum


class BienTheSanPhamBase(BaseModel):
    san_pham_id: Optional[int] = Field(None, description="ID của sản phẩm cha")
    ten_bien_the: Optional[str] = Field(None, max_length=100, description="Tên biến thể sản phẩm")
    trang_thai_kich_hoat: Optional[TrangThaiSanPhamEnum] = Field(
        TrangThaiSanPhamEnum.DANG_BAN,
        description="Trạng thái kích hoạt của biến thể sản phẩm"
    )
    # so_luong: Optional[int] = Field(0, ge=0, description="Số lượng tồn kho của biến thể sản phẩm")
    gia_ban: Decimal = Field(..., gt=0, description="Giá bán của biến thể sản phẩm")
    mau: Optional[str] = Field(None,max_length=20, description="Màu của biến thể")

class BienTheSanPhamCreate(BienTheSanPhamBase):
    hinh_anhs: Optional[List[HinhAnhCreate]] = Field(
        [], description="Danh sách ảnh của biến thể"
    )
    model_config = ConfigDict(use_enum_values=True)


class BienTheSanPhamUpdate(BaseModel):
    id: Optional[int] = Field(None)
    ten_bien_the: Optional[str] = Field(None, max_length=100)
    trang_thai_kich_hoat: Optional[TrangThaiSanPhamEnum] = None
    gia_ban: Optional[Decimal] = Field(None, gt=0)
    mau: Optional[str] = Field(None, max_length=20)
    hinh_anhs: Optional[List[HinhAnhUpdate]] = Field([], description="Danh sách ảnh cập nhật")

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)  


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


class BienTheBasicResponse(BaseModel):
    """
    Schema trả về thông tin cơ bản của biến thể (chỉ id và tên)
    """
    id: int
    ten_bien_the: str = Field(..., description="Tên biến thể sản phẩm")
    
    model_config = ConfigDict(from_attributes=True)


class BienTheBasicListResponse(BaseModel):
    """
    Schema trả về danh sách biến thể cơ bản
    """
    data: List[BienTheBasicResponse] = Field(..., description="Danh sách biến thể cơ bản")
    
    model_config = ConfigDict(from_attributes=True)