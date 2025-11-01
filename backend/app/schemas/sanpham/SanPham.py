# /backend/app/schemas/SanPham.py
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime
from decimal import Decimal

from ..Shared import TrangThaiSanPhamEnum
from .DanhMuc import DanhMucResponse
from .ThuongHieu import ThuongHieuResponse
from .BienTheSanPham import BienTheSanPhamCreate, BienTheSanPhamResponse


class SanPhamBase(BaseModel):
    danh_muc_id: int = Field(..., description="ID của danh mục sản phẩm")
    thuong_hieu_id: int = Field(..., description="ID của thương hiệu sản phẩm")
    ten_san_pham: str = Field(..., max_length=200, description="Tên sản phẩm")
    mo_ta: Optional[str] = Field(None, description="Mô tả sản phẩm")
    thong_so_ky_thuat: Optional[Dict[str, Any]] = Field(None, description="Thông số kỹ thuật")
    trang_thai: Optional[TrangThaiSanPhamEnum] = Field(
        TrangThaiSanPhamEnum.DANG_BAN,
        description="Trạng thái của sản phẩm"
    )
    ngay_tao: Optional[datetime] = Field(None, description="Ngày tạo sản phẩm")
    ngay_cap_nhat: Optional[datetime] = Field(None, description="Ngày cập nhật sản phẩm")

    model_config = ConfigDict(from_attributes=True)


class SanPhamCreate(SanPhamBase):
    bien_the_san_phams: Optional[List[BienTheSanPhamCreate]] = Field(
        [], description="Danh sách biến thể sản phẩm"
    )


class SanPhamUpdate(BaseModel):
    danh_muc_id: Optional[int] = Field(None)
    thuong_hieu_id: Optional[int] = Field(None)
    ten_san_pham: Optional[str] = Field(None, max_length=200)
    mo_ta: Optional[str] = Field(None)
    thong_so_ky_thuat: Optional[Dict[str, Any]] = Field(None)
    trang_thai: Optional[TrangThaiSanPhamEnum] = None

    model_config = ConfigDict(from_attributes=True)


class SanPhamDelete(BaseModel):
    id: int


class SanPhamResponse(SanPhamBase):
    id: int
    ma_san_pham: str = Field(..., max_length=24, description="Mã sản phẩm")
    danh_muc: DanhMucResponse
    thuong_hieu: ThuongHieuResponse
    cac_bien_the: List[BienTheSanPhamResponse] = Field(  # Sửa: dùng Response
        default_factory=list,
        description="Danh sách biến thể (đã có ảnh, giá, tồn kho)"
    )

    model_config = ConfigDict(from_attributes=True)  # XÓA extra='allow' → nguy hiểm!


class SanPhamPublic(SanPhamResponse):
    trung_binh_danh_gia: Optional[Decimal] = Field(None, description="Điểm trung bình")
    so_luong_danh_gia: Optional[int] = Field(0, description="Tổng số đánh giá")


class SanPhamListResponse(BaseModel):
    data: List[SanPhamResponse] = Field(..., description="Danh sách sản phẩm")
    pagination: Dict[str, int] = Field(..., description="page, per_page, total, pages")

    model_config = ConfigDict(from_attributes=True)