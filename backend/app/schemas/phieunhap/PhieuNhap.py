from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from .ChiTietPhieuNhap import *
class PhieuNhapBase(BaseModel):
    nha_cung_cap_id: int = Field(..., description="ID nhà cung cấp")
    nguoi_nhap_id: Optional[int] = Field(None, description="ID người dùng")
    model_config = ConfigDict(from_attributes=True)

class PhieuNhapCreate(PhieuNhapBase):
    phieu_nhap_chi_tiets: List[ChiTietPhieuNhapCreate] = Field(..., description="Danh sách chi tiết phiếu nhập")

class PhieuNhapUpdate(BaseModel):
    nha_cung_cap_id: Optional[int] = Field(None, description="ID nhà cung cấp")
    phieu_nhap_chi_tiets: Optional[List[ChiTietPhieuNhapUpdate]] = None
    model_config = ConfigDict(from_attributes=True)

class PhieuNhapResponse(PhieuNhapBase):
    id: int
    ma_phieu_nhap: str = Field(..., max_length=25, description="Mã phiếu nhập")
    cac_chi_tiet_phieu_nhap: List[ChiTietPhieuNhapResponse] = Field(
        default_factory=list,
        description="Danh sách chi tiết phiếu thu"
    )
    nha_cung_cap_id: int = Field(..., description="ID nhà cung cấp")
    ten_nha_cung_cap: str = Field(..., description="Tên nhà cung cấp")
    ngay_nhap: Optional[datetime] = Field(None, description="Ngày nhập")
    nguoi_nhap_id: Optional[int] = Field(None, description="ID người nhập")
    ngay_cap_nhat: Optional[datetime] = Field(None, description="Ngày cập nhật")
    tong_so_luong: int = Field(0, description="Tổng số lượng sản phẩm")
    tong_gia_tri: Decimal = Field(0, description="Tổng giá trị phiếu thu")
    
    model_config = ConfigDict(from_attributes=True)

class PhieuNhapPath(BaseModel):
    phieu_nhap_id: int = Field(..., description="ID của phiếu nhập")
    model_config = ConfigDict(from_attributes=True)