from pydantic import BaseModel, Field
from datetime import datetime
from ..sanpham import SanPhamPublic


class ChiTietGioHangBase(BaseModel):
    so_luong: int = Field(..., gt=0, description="Số lượng sản phẩm phải lớn hơn 0")

class ChiTietGioHangCreate(ChiTietGioHangBase):
    bien_the_san_pham_id: int = Field(..., description="ID của biến thể sản phẩm cụ thể")

class ChiTietGioHangUpdate(ChiTietGioHangBase):
    so_luong: int = Field(..., gt=0, description="Số lượng sản phẩm mới")

class ChiTietGioHangResponse(ChiTietGioHangBase):
    id: int
    ngay_them: datetime
    san_pham: SanPhamPublic

    class Config:
        orm_mode = True


