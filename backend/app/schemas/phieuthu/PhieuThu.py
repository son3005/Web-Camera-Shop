from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from .ChitietPhieuThu import *


class PhieuThuBase(BaseModel):
    ten_nha_cung_cap: str = Field(...,max_length=100, description="Tên của cấp độ")
    nguoi_nhap_id: Optional[int] = Field(None, description="ID người dùng")
    model_config = ConfigDict(from_attributes=True)

class PhieuThuCreate(PhieuThuBase):
    phieu_thu_chi_tiets: Optional[List[ChiTietPhieuThuCreate]] = Field([], description="Danh sách chi tiết phiếu thu")


class PhieuThuUpdate(BaseModel):
    ten_nha_cung_cap: Optional[str] = Field(None, max_length=100)
    phieu_thu_chi_tiets: Optional[List[ChiTietPhieuThuUpdate]] = None
    model_config = ConfigDict(from_attributes=True)

class PhieuThuDelete(BaseModel):
    id:int

class PhieuThuRespone(PhieuThuBase):
    id: int
    ma_phieu_thu: str = Field(...,max_length=25, description="Mã phiếu thu")
    cac_chi_tiet_phieu_thu: List[ChiTietPhieuThuResponse] = Field(
        default_factory=list,
        description="Danh sách chi tiết phiếu thu"
    )

    model_config = ConfigDict(from_attributes=True)