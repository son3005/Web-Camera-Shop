# /backend/app/schemas/giohang/ChiTietGioHang.py
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from ..sanpham.SanPham import SanPhamPublic  # Import đúng


class ChiTietGioHangBase(BaseModel):
    gio_hang_id: int = Field(..., description="ID giỏ hàng")
    bien_the_san_pham_id: int = Field(..., description="ID biến thể")
    so_luong: int = Field(1, ge=1, description="Số lượng")
    ngay_them: datetime = Field(default_factory=datetime.utcnow, description="Ngày thêm")

    model_config = ConfigDict(from_attributes=True)


class ChiTietGioHangCreate(BaseModel):
    bien_the_san_pham_id: int = Field(..., description="ID biến thể")
    so_luong: int = Field(1, ge=1, description="Số lượng")


class ChiTietGioHangUpdate(BaseModel):
    so_luong: int = Field(..., ge=1, description="Số lượng mới")

    model_config = ConfigDict(from_attributes=True)


class ChiTietGioHangResponse(ChiTietGioHangBase):
    id: int = Field(..., description="ID mục trong giỏ")
    san_pham: SanPhamPublic = Field(..., description="Thông tin sản phẩm")

    model_config = ConfigDict(from_attributes=True)