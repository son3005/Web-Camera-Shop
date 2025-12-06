from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

class ChiTietPhieuNhapBase(BaseModel):
    bien_the_san_pham_id: int = Field(..., description="ID biến thể sản phẩm")
    so_luong: int = Field(..., ge=1, description="Số lượng")
    gia_nhap_tung_vat: Decimal = Field(..., gt=0, description="Giá bán của biến thể sản phẩm")

    model_config = ConfigDict(from_attributes=True)

class ChiTietPhieuNhapCreate(ChiTietPhieuNhapBase):
    pass

class ChiTietPhieuNhapUpdate(BaseModel):
    id: Optional[int] = Field(None, description="ID của chi tiết phiếu nhập")
    bien_the_san_pham_id: Optional[int] = Field(None, description="ID biến thể sản phẩm")
    so_luong: Optional[int] = Field(None, ge=1, description="Số lượng")
    gia_nhap_tung_vat: Optional[Decimal] = Field(None, gt=0, description="Giá nhập của biến thể sản phẩm")
    
    model_config = ConfigDict(from_attributes=True)

class ChiTietPhieuNhapDelete(BaseModel):
    id: int

class ChiTietPhieuNhapResponse(ChiTietPhieuNhapBase):
    id: int = Field(..., description="ID của chi tiết phiếu nhập")
    phieu_nhap_id: int = Field(..., description="ID phiếu nhập")
    ngay_cap_nhat: Optional[datetime] = Field(None, description="Ngày cập nhật")
    ten_san_pham: Optional[str] = Field(None, description="Tên sản phẩm")
    ten_bien_the: Optional[str] = Field(None, description="Tên biến thể sản phẩm")
    ma_san_pham: Optional[str] = Field(None, description="Mã sản phẩm")
    anh_dai_dien: Optional[str] = Field(None, description="URL ảnh đại diện")

    model_config = ConfigDict(from_attributes=True)