from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

# Import các schema cần thiết để lồng vào
from ..sanpham import SanPhamPublic # Dùng schema công khai để hiển thị sản phẩm trong giỏ hàng

class ChiTietGioHangBase(BaseModel):
    """Schema cơ sở cho một mục trong giỏ hàng."""
    so_luong: int = Field(..., gt=0, description="Số lượng sản phẩm phải lớn hơn 0")

class ChiTietGioHangCreate(ChiTietGioHangBase):
    """Schema để thêm một sản phẩm vào giỏ hàng."""
    bien_the_san_pham_id: int = Field(..., description="ID của biến thể sản phẩm cụ thể")

class ChiTietGioHangUpdate(BaseModel):
    """Schema để cập nhật số lượng của một mục trong giỏ hàng."""
    so_luong: int = Field(..., gt=0, description="Số lượng sản phẩm mới")

class ChiTietGioHangResponse(ChiTietGioHangBase):
    """Schema trả về thông tin chi tiết của một mục trong giỏ hàng."""
    id: int
    ngay_them: datetime
    # Lồng thông tin sản phẩm vào để frontend dễ dàng hiển thị
    san_pham: SanPhamPublic

    class Config:
        orm_mode = True

class GioHangResponse(BaseModel):
    """Schema trả về thông tin đầy đủ của giỏ hàng."""
    id: int
    nguoi_dung_id: int
    items: List[ChiTietGioHangResponse] = []
    
    # Các trường được tính toán ở backend trước khi trả về
    tong_so_luong: int = Field(..., description="Tổng số lượng sản phẩm trong giỏ")
    tam_tinh: Decimal = Field(..., description="Tổng giá trị các sản phẩm trong giỏ")

    class Config:
        orm_mode = True