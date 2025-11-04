from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from decimal import Decimal

class ChiTietPhieuThuBase(BaseModel):
    phieu_thu_id: int = Field(...,description="ID phiếu thu")
    bien_the_san_pham_id: Optional[int] = Field(None, description="ID biến thể sản phẩm")
    so_luong: int = Field(..., ge=1, description="Số lượng")
    gia_nhap_tung_vat: Decimal = Field(..., gt=0, description="Giá bán của biến thể sản phẩm")

    model_config = ConfigDict(from_attributes=True)

class ChiTietPhieuThuCreate(ChiTietPhieuThuBase):
    pass

class ChiTietPhieuThuUpdate(BaseModel):
    so_luong: int = Field(..., ge=1, description="Số lượng")
    gia_nhap_tung_vat: Decimal = Field(..., gt=0, description="Giá nhập của biến thể sản phẩm")
    
    model_config = ConfigDict(from_attributes=True)

class ChiTietPhieuThuDelete(BaseModel):
    id: int

class ChiTietPhieuThuResponse(ChiTietPhieuThuBase):
    id: int = Field(...,description="ID của chi tiết phiếu thu")
    