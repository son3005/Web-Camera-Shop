from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime
from decimal import Decimal

# Import các thành phần cần thiết từ các file schema khác
from ..Shared import TrangThaiSanPhamEnum
from .DanhMuc import DanhMucResponse
from .ThuongHieu import ThuongHieuResponse
from .BienTheSanPham import BienTheCreate, BienTheResponse

class SanPhamBase(BaseModel):
    ten_san_pham: str = Field(..., max_length=200, description="Tên sản phẩm")
    mo_ta: Optional[str] = Field(None, description="Mô tả chi tiết sản phẩm")
    thong_so_ky_thuat: Optional[Dict[str, Any]] = Field(None, description="Thông số kỹ thuật dưới dạng JSON")
    trang_thai: TrangThaiSanPhamEnum = Field(TrangThaiSanPhamEnum.DANG_BAN, description="Trạng thái sản phẩm")

class SanPhamCreate(SanPhamBase):
    danh_muc_id: int
    thuong_hieu_id: int
    cac_bien_the: List[BienTheCreate] = Field(..., min_items=1, description="Phải có ít nhất một biến thể sản phẩm")

class SanPhamUpdate(BaseModel):
    ten_san_pham: Optional[str] = Field(None, max_length=200)
    mo_ta: Optional[str] = None
    thong_so_ky_thuat: Optional[Dict[str, Any]] = None
    trang_thai: Optional[TrangThaiSanPhamEnum] = None
    danh_muc_id: Optional[int] = None
    thuong_hieu_id: Optional[int] = None

class SanPhamPublic(BaseModel):
    id: int
    ma_san_pham: str
    ten_san_pham: str
    slug: str
    gia_goc: Optional[Decimal] = None
    gia_hien_tai: Optional[Decimal] = None
    anh_dai_dien_url: Optional[str] = None
    thuong_hieu: Optional[ThuongHieuResponse] = None

    class Config:
        orm_mode = True

class SanPhamResponse(SanPhamBase):
    id: int
    ma_san_pham: str
    slug: str
    ngay_tao: datetime
    ngay_cap_nhat: datetime
    danh_muc: DanhMucResponse
    thuong_hieu: ThuongHieuResponse
    cac_bien_the: List[BienTheResponse] = []

    class Config:
        orm_mode = True