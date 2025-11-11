from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from decimal import Decimal
from ...models.enums import PhuongThucThanhToanEnum

class ChiTietDonHangAoRequest(BaseModel):
    id_bien_the: int = Field(..., description="ID biến thể sản phẩm")
    so_luong: int = Field(..., ge=1, description="Số lượng")

    model_config = ConfigDict(from_attributes=True)

class DonHangAoCreateRequest(BaseModel):
    id_dia_chi: Optional[int] = Field(None, description="ID địa chỉ giao hàng")
    ten_nguoi_nhan: str = Field(..., max_length=50, description="Tên người nhận")
    so_dien_thoai_nguoi_nhan: str = Field(..., max_length=15, description="Số điện thoại người nhận")
    dia_chi_giao: str = Field(..., max_length=500, description="Địa chỉ giao hàng")
    phuong_thuc_thanh_toan: PhuongThucThanhToanEnum = Field(..., description="Phương thức thanh toán")
    phi_van_chuyen: Decimal = Field(default=2000, ge=0, description="Phí vận chuyển")
    ghi_chu: Optional[str] = Field(None, max_length=1000, description="Ghi chú")
    items: List[ChiTietDonHangAoRequest] = Field(..., description="Danh sách sản phẩm")

    model_config = ConfigDict(from_attributes=True)