# /backend/app/schemas/giohang_dathang/DonHang.py
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from ..Shared import TrangThaiDonHangEnum, PhuongThucThanhToanEnum
from .ThanhToan import ThanhToanResponse
from .ChiTietDonHang import ChiTietDonHangResponse


class DonHangBase(BaseModel):
    nguoi_dung_id: Optional[int] = Field(None, description="ID người dùng")
    ma_don_hang: Optional[str] = Field(None, max_length=25, description="Mã đơn hàng")
    dia_chi_id: Optional[int] = Field(None, description="ID địa chỉ giao")
    ten_nguoi_nhan: str = Field(..., max_length=50, description="Tên người nhận")
    so_dien_thoai_nguoi_nhan: str = Field(..., max_length=15, description="SĐT người nhận")
    dia_chi_giao: str = Field(..., max_length=500, description="Địa chỉ giao hàng")
    trang_thai: TrangThaiDonHangEnum = Field(default=TrangThaiDonHangEnum.CHO_XAC_NHAN, description="Trạng thái đơn hàng")
    phi_van_chuyen: Decimal = Field(default=Decimal('0'), ge=0, description="Phí vận chuyển")
    ghi_chu: Optional[str] = Field(None, max_length=1000, description="Ghi chú")

    model_config = ConfigDict(from_attributes=True)


class DonHangCreate(DonHangBase):
    pass


class DonHangUpdate(BaseModel):
    trang_thai: TrangThaiDonHangEnum = Field(..., description="Trạng thái mới của đơn hàng")
    ghi_chu: Optional[str] = Field(None, max_length=1000, description="Ghi chú đơn hàng")
    ly_do: Optional[str] = Field(None, description="Lý do thay đổi trạng thái (nếu có)")

    model_config = ConfigDict(from_attributes=True)

class DonHangCancelRequest(BaseModel):
    id: int = Field(..., description="ID đơn hàng cần hủy")
    ly_do: Optional[str] = Field(None, description="Lý do hủy đơn hàng")

    model_config = ConfigDict(from_attributes=True)


class DonHangResponse(DonHangBase):
    id: int = Field(..., description="ID đơn hàng")
    ma_don_hang: str = Field(..., max_length=25, description="Mã đơn hàng")
    ngay_tao: Optional[datetime] = Field(None, description="Ngày tạo")  
    ngay_cap_nhat: Optional[datetime] = Field(None, description="Ngày cập nhật") 
    items: List[ChiTietDonHangResponse] = Field(default_factory=list, description="Danh sách sản phẩm trong đơn")
    thanh_toan: Optional[ThanhToanResponse] = Field(None, description="Thông tin thanh toán")

    model_config = ConfigDict(from_attributes=True)
