# /backend/app/schemas/BienTheSanPham.py
from pydantic import BaseModel, Field, ConfigDict
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
    gia_khuyen_mai: Optional[Decimal] = Field(None, gt=0, description="Giá khuyến mãi")
    ngay_bat_dau_khuyen_mai: Optional[datetime] = Field(None, description="Ngày bắt đầu KM")
    ngay_ket_thuc_khuyen_mai: Optional[datetime] = Field(None, description="Ngày kết thúc KM")
    so_luong_ton: int = Field(..., ge=0, description="Số lượng tồn kho")


class BienTheSanPhamCreate(BienTheSanPhamBase):
    hinh_anhs: Optional[List[HinhAnhCreate]] = Field(
        [], description="Danh sách ảnh của biến thể"
    )


class BienTheSanPhamUpdate(BaseModel):
    ten_bien_the: Optional[str] = Field(None, max_length=100)
    trang_thai_kich_hoat: Optional[TrangThaiSanPhamEnum] = None
    gia_ban: Optional[Decimal] = Field(None, gt=0)
    gia_khuyen_mai: Optional[Decimal] = Field(None, gt=0)
    ngay_bat_dau_khuyen_mai: Optional[datetime] = None
    ngay_ket_thuc_khuyen_mai: Optional[datetime] = None
    so_luong_ton: Optional[int] = Field(None, ge=0)
    new_hinh_anhs: Optional[List[HinhAnhCreate]] = Field([], description="Ảnh mới")
    deleted_hinh_anh_ids: Optional[List[int]] = Field([], description="ID ảnh xóa")

    model_config = ConfigDict(from_attributes=True)


class BienTheSanPhamDelete(BaseModel):
    id: int


class BienTheSanPhamResponse(BienTheSanPhamBase):
    id: int
    hinh_anhs: List[HinhAnhResponse] = Field(
        default_factory=list,
        description="Danh sách ảnh của biến thể"
    )

    model_config = ConfigDict(from_attributes=True)