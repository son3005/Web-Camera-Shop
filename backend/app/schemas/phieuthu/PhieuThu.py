from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from .ChitietPhieuThu import ChiTietPhieuThuCreate, ChiTietPhieuThuUpdate, ChiTietPhieuThuResponse

class PhieuThuBase(BaseModel):
    ten_nha_cung_cap: str = Field(..., max_length=100, description="Tên nhà cung cấp")
    nguoi_nhap_id: Optional[int] = Field(None, description="ID người dùng")
    model_config = ConfigDict(from_attributes=True)

class PhieuThuCreate(PhieuThuBase):
    phieu_thu_chi_tiets: List[ChiTietPhieuThuCreate] = Field(..., description="Danh sách chi tiết phiếu thu")

class PhieuThuUpdate(BaseModel):
    ten_nha_cung_cap: Optional[str] = Field(None, max_length=100)
    phieu_thu_chi_tiets: Optional[List[ChiTietPhieuThuUpdate]] = None
    model_config = ConfigDict(from_attributes=True)

class PhieuThuResponse(PhieuThuBase):
    id: int
    ma_phieu_thu: str = Field(..., max_length=25, description="Mã phiếu thu")
    cac_chi_tiet_phieu_thu: List[ChiTietPhieuThuResponse] = Field(
        default_factory=list,
        description="Danh sách chi tiết phiếu thu"
    )
    ngay_thu: Optional[datetime] = Field(None, description="Ngày thu")
    ngay_cap_nhat: Optional[datetime] = Field(None, description="Ngày cập nhật")
    tong_so_luong: int = Field(0, description="Tổng số lượng sản phẩm")
    tong_gia_tri: Decimal = Field(0, description="Tổng giá trị phiếu thu")
    
    model_config = ConfigDict(from_attributes=True)

class PhieuThuPath(BaseModel):
    phieu_thu_id: int = Field(..., description="ID của phiếu thu")
    model_config = ConfigDict(from_attributes=True)