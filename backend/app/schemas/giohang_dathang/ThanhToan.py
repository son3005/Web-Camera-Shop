from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ...models.enums import TrangThaiThanhToanEnum, PhuongThucThanhToanEnum

class ThanhToanBase(BaseModel):
    so_tien: Decimal = Field(..., description="Số tiền thanh toán")
    phuong_thuc: PhuongThucThanhToanEnum = Field(PhuongThucThanhToanEnum.COD, description="Phương thức thanh toán")
    trang_thai: TrangThaiThanhToanEnum = Field(TrangThaiThanhToanEnum.CHO_THANH_TOAN, description="Trạng thái thanh toán")
    ma_giao_dich_ben_thu_3: Optional[str] = Field(None, description="Mã giao dịch từ bên thứ 3, nếu có")
    ngay_tao: Optional[datetime] = Field(None, description="Ngày tạo bản ghi")
    ngay_cap_nhat: Optional[datetime] = Field(None, description="Ngày cập nhật bản ghi")

class ThanhToanCreate(ThanhToanBase):
    don_hang_id: int = Field(..., description="ID của đơn hàng liên kết")

class ThanhToanUpdate(BaseModel):
    trang_thai: Optional[TrangThaiThanhToanEnum] = Field(None, description="Cập nhật trạng thái thanh toán")
    ma_giao_dich_ben_thu_3: Optional[str] = Field(None, description="Cập nhật mã giao dịch từ bên thứ 3")

class ThanhToanResponse(ThanhToanBase):
    id: int = Field(..., description="ID của bản ghi thanh toán")
    don_hang_id: int = Field(..., description="ID của đơn hàng liên kết")

    class Config:
        orm_mode = True

