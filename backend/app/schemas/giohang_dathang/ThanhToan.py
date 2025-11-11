# /backend/app/schemas/giohang_dathang/ThanhToan.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal
from ...models.enums import TrangThaiThanhToanEnum, PhuongThucThanhToanEnum


class ThanhToanBase(BaseModel):
    don_hang_id: int = Field(..., description="ID đơn hàng")
    so_tien: Decimal = Field(..., ge=0, description="Số tiền thanh toán")
    phuong_thuc: PhuongThucThanhToanEnum = Field(default=PhuongThucThanhToanEnum.COD, description="Phương thức thanh toán")
    trang_thai: TrangThaiThanhToanEnum = Field(default=TrangThaiThanhToanEnum.CHO_THANH_TOAN, description="Trạng thái thanh toán")
    ma_giao_dich_ben_thu_3: Optional[str] = Field(None, max_length=255, description="Mã giao dịch bên thứ 3")
    ngay_tao: Optional[datetime] = Field(None, description="Ngày tạo")  
    ngay_cap_nhat: Optional[datetime] = Field(None, description="Ngày cập nhật")

    model_config = ConfigDict(from_attributes=True)


class ThanhToanCreate(ThanhToanBase):
    pass


class ThanhToanUpdate(BaseModel):
    trang_thai: Optional[TrangThaiThanhToanEnum] = None
    ma_giao_dich_ben_thu_3: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ThanhToanResponse(ThanhToanBase):
    id: int = Field(..., description="ID thanh toán")

    model_config = ConfigDict(from_attributes=True)