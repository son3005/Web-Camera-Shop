# /backend/app/schemas/BienTheSanPham.py

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from ..sanpham import HinhAnhResponse, HinhAnhCreate
from ..Shared import TrangThaiSanPhamEnum
from decimal import Decimal

class BienTheSanPhamBase(BaseModel):
    san_pham_id: int = Field(..., description="ID của sản phẩm cha")
    ten_bien_the: Optional[str] = Field(None, max_length=100, description="Tên biến thể sản phẩm")
    trang_thai_kich_hoat: Optional[TrangThaiSanPhamEnum] = Field(TrangThaiSanPhamEnum.DANG_BAN, description="Trạng thái kích hoạt của biến thể sản phẩm")
    gia_ban: Decimal = Field(..., gt=0, description="Giá bán của biến thể sản phẩm")
    gia_khuyen_mai: Optional[Decimal] = Field(None, gt=0, description="Giá khuyến mãi của biến thể sản phẩm")
    ngay_bat_dau_khuyen_mai: Optional[datetime] = Field(None, description="Ngày bắt đầu khuyến mãi")
    ngay_ket_thuc_khuyen_mai: Optional[datetime] = Field(None, description="Ngày kết thúc khuyến mãi")
    so_luong_ton: int = Field(..., ge=0, description="Số lượng tồn kho của biến thể sản phẩm")

class BienTheSanPhamCreate(BienTheSanPhamBase):
    hinh_anhs: Optional[List[HinhAnhCreate]] = Field([], description="Danh sách ảnh của biến thể")

class BienTheSanPhamUpdate(BaseModel):
    ten_bien_the: Optional[str] = Field(None, max_length=100)
    trang_thai_kich_hoat: Optional[TrangThaiSanPhamEnum] = None
    gia_ban: Optional[Decimal] = Field(None, gt=0)
    gia_khuyen_mai: Optional[Decimal] = Field(None, gt=0)
    ngay_bat_dau_khuyen_mai: Optional[datetime] = None
    ngay_ket_thuc_khuyen_mai: Optional[datetime] = None
    so_luong_ton: Optional[int] = Field(None, ge=0)
class BienTheSanPhamDelete(BaseModel):
    id: int

class BienTheSanPhamResponse(BienTheSanPhamBase):
    id: int
    hinh_anhs: List[HinhAnhResponse] = []

    class Config:
        orm_mode = True