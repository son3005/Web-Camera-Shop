from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from decimal import Decimal
from typing import Optional


class ChiTietGioHangBase(BaseModel):
    gio_hang_id: int = Field(..., description="ID giỏ hàng")
    bien_the_san_pham_id: int = Field(..., description="ID biến thể sản phẩm")
    so_luong: int = Field(..., ge=1, description="Số lượng")

    model_config = ConfigDict(from_attributes=True)


class ChiTietGioHangCreate(ChiTietGioHangBase):
    pass


class ChiTietGioHangUpdate(BaseModel):
    so_luong: int = Field(..., ge=1, description="Số lượng mới")

    model_config = ConfigDict(from_attributes=True)


class ChiTietGioHangResponse(ChiTietGioHangBase):
    id: int = Field(..., description="ID chi tiết giỏ hàng")
    ngay_them: datetime = Field(None, description="Ngày thêm vào giỏ")
    
    # Thông tin từ biến thể sản phẩm
    ten_san_pham: str = Field(..., description="Tên sản phẩm")
    ten_bien_the: Optional[str] = Field(None, description="Tên biến thể")
    don_gia: Decimal = Field(..., description="Đơn giá hiện tại")
    thanh_tien: Decimal = Field(..., description="Thành tiền = số lượng × đơn giá")
    hinh_anh: Optional[str] = Field(None, description="URL hình ảnh")

    model_config = ConfigDict(from_attributes=True)