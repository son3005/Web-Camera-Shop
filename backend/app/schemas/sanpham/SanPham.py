from pydantic import BaseModel, Field, validator
from typing import List, Optional, Any, Dict
from datetime import datetime
from decimal import Decimal

# Import schema liên quan
from ..Shared import TrangThaiSanPhamEnum
from .DanhMuc import DanhMucResponse
from .ThuongHieu import ThuongHieuResponse
from .BienTheSanPham import BienTheSanPhamCreate, BienTheSanPhamResponse
from ...models.enums import TrangThaiDanhGiaEnum


class SanPhamBase(BaseModel):
    danh_muc_id: int = Field(..., description="ID của danh mục sản phẩm")
    thuong_hieu_id: int = Field(..., description="ID của thương hiệu sản phẩm")
    ten_san_pham: str = Field(..., max_length=200, description="Tên sản phẩm")
    mo_ta: Optional[str] = Field(None, description="Mô tả sản phẩm")
    thong_so_ky_thuat: Optional[Dict[str, Any]] = Field(None, description="Thông số kỹ thuật của sản phẩm")
    trang_thai: Optional[TrangThaiSanPhamEnum] = Field(TrangThaiSanPhamEnum.DANG_BAN, description="Trạng thái của sản phẩm")
    ngay_tao: Optional[datetime] = Field(None, description="Ngày tạo sản phẩm")
    ngay_cap_nhat: Optional[datetime] = Field(None, description="Ngày cập nhật sản phẩm")

class SanPhamCreate(SanPhamBase):
    bien_the_san_phams: Optional[List[BienTheSanPhamCreate]] = Field([], description="Danh sách biến thể sản phẩm")

class SanPhamUpdate(BaseModel):
    danh_muc_id: Optional[int] = Field(None, description="ID của danh mục sản phẩm")
    thuong_hieu_id: Optional[int] = Field(None, description="ID của thương hiệu sản phẩm")
    ten_san_pham: Optional[str] = Field(None, max_length=200, description="Tên sản phẩm")
    mo_ta: Optional[str] = Field(None, description="Mô tả sản phẩm")
    thong_so_ky_thuat: Optional[Dict[str, Any]] = Field(None, description="Thông số kỹ thuật của sản phẩm")
    trang_thai: Optional[TrangThaiSanPhamEnum] = Field(None, description="Trạng thái của sản phẩm")

class SanPhamDelete(BaseModel):
    id: int

class SanPhamResponse(SanPhamBase):
    id: int
    danh_muc: DanhMucResponse
    thuong_hieu: ThuongHieuResponse
    cac_bien_the: List[BienTheSanPhamResponse] = []

    class Config:
        orm_mode = True

class SanPhamPublic(SanPhamResponse):
    """Schema công khai cho sản phẩm, có thể thêm các trường tính toán ở đây."""
    trung_binh_danh_gia: Optional[Decimal] = Field(None, description="Điểm đánh giá trung bình của sản phẩm")
    so_luong_danh_gia: Optional[int] = Field(0, description="Tổng số đánh giá của sản phẩm")