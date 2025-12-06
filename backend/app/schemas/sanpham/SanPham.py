# /backend/app/schemas/SanPham.py
from pydantic import BaseModel, Field, ConfigDict, validator
from typing import List, Optional, Any, Dict
from datetime import datetime
from decimal import Decimal

from ..Shared import TrangThaiSanPhamEnum
from .DanhMuc import DanhMucResponse
from .CapDo import CapDoResponse
from .ThuongHieu import ThuongHieuResponse
from .BienTheSanPham import BienTheSanPhamCreate, BienTheSanPhamResponse, BienTheSanPhamUpdate


class SanPhamBase(BaseModel):
    ten_san_pham: str = Field(..., max_length=100, description="Tên sản phẩm")
    mo_ta: Optional[str] = Field(None, description="Mô tả sản phẩm")
    thong_so_ky_thuat: Optional[Dict[str, Any]] = Field(None, description="Thông số kỹ thuật")
    ngay_tao: Optional[datetime] = Field(None, description="Ngày tạo sản phẩm")
    ngay_cap_nhat: Optional[datetime] = Field(None, description="Ngày cập nhật sản phẩm")

    model_config = ConfigDict(from_attributes=True)


class SanPhamCreate(SanPhamBase):
    danh_muc_id: int = Field(..., description="ID của danh mục sản phẩm")
    thuong_hieu_id: int = Field(..., description="ID của thương hiệu sản phẩm")
    cap_do_id: int = Field(..., description="ID của cấp độ sản phẩm")
    cac_bien_the: Optional[List[BienTheSanPhamCreate]] = Field(  # ĐỔI TÊN: từ bien_the_san_phams
        [], description="Danh sách biến thể sản phẩm"
    )


class SanPhamUpdate(BaseModel):
    danh_muc_id: Optional[int] = Field(None)
    thuong_hieu_id: Optional[int] = Field(None)
    cap_do_id: Optional[int] = Field(None)
    ten_san_pham: Optional[str] = Field(None, max_length=100)
    mo_ta: Optional[str] = Field(None)
    thong_so_ky_thuat: Optional[Dict[str, Any]] = Field(None)
    cac_bien_the: Optional[List[BienTheSanPhamUpdate]] = Field(None, description="Danh sách biến thể cập nhật")
    bien_the_xoa_ids: Optional[List[int]] = Field([], description="IDs biến thể cần xóa")

    model_config = ConfigDict(from_attributes=True)


class SanPhamDelete(BaseModel):
    id: int


class SanPhamResponse(SanPhamBase):
    id: int
    ma_san_pham: str = Field(..., max_length=24, description="Mã sản phẩm")
    danh_muc: DanhMucResponse
    cap_do: CapDoResponse
    thuong_hieu: ThuongHieuResponse
    so_sao_trung_binh: Optional[Decimal] = Field(0, description="Điểm trung bình")
    so_luong_danh_gia: Optional[int] = Field(0, description="Tổng số đánh giá")
    cac_bien_the: List[BienTheSanPhamResponse] = Field(
        default_factory=list,
        description="Danh sách biến thể (đã có ảnh, giá, tồn kho)"
    )
    model_config = ConfigDict(from_attributes=True)


class SanPhamPublic(SanPhamResponse):
    trung_binh_danh_gia: Optional[Decimal] = Field(None, description="Điểm trung bình")
    so_luong_danh_gia: Optional[int] = Field(0, description="Tổng số đánh giá")


class SanPhamListResponse(BaseModel):
    data: List[SanPhamResponse] = Field(..., description="Danh sách sản phẩm")
    pagination: Dict[str, int] = Field(..., description="page, per_page, total, pages")

    model_config = ConfigDict(from_attributes=True)


class SanPhamBasicResponse(BaseModel):
    """
    Schema trả về thông tin cơ bản của sản phẩm (chỉ id và tên)
    """
    id: int
    ten_san_pham: str = Field(..., description="Tên sản phẩm")
    
    model_config = ConfigDict(from_attributes=True)


class SanPhamBasicListResponse(BaseModel):
    """
    Schema trả về danh sách sản phẩm cơ bản
    """
    data: List[SanPhamBasicResponse] = Field(..., description="Danh sách sản phẩm cơ bản")
    
    model_config = ConfigDict(from_attributes=True)

class SanPhamLienQuanResponse(SanPhamBase):
    id: int
    ma_san_pham: str = Field(..., max_length=24, description="Mã sản phẩm")
    # danh_muc: DanhMucResponse
    # cap_do: CapDoResponse
    # thuong_hieu: ThuongHieuResponse
    so_sao_trung_binh: Optional[Decimal] = Field(0, description="Điểm trung bình")
    so_luong_danh_gia: Optional[int] = Field(0, description="Tổng số đánh giá")
    cac_bien_the: List[BienTheSanPhamResponse] = Field(
        default_factory=list,
        description="Danh sách biến thể (đã có ảnh, giá, tồn kho)"
    )
    model_config = ConfigDict(from_attributes=True)