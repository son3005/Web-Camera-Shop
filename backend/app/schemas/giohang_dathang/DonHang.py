# /backend/app/schemas/giohang_dathang/DonHang.py
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

from ..Shared import TrangThaiDonHangEnum, PhuongThucThanhToanEnum
from .ThanhToan import ThanhToanResponse
from .ChiTietDonHang import ChiTietDonHangResponse  # Đã sửa tên file


class DonHangBase(BaseModel):
    nguoi_dung_id: Optional[int] = Field(None, description="ID người dùng")
    dia_chi_id: Optional[int] = Field(None, description="ID địa chỉ giao")
    ten_nguoi_nhan: str = Field(..., max_length=50, description="Tên người nhận")
    so_dien_thoai_nguoi_nhan: str = Field(..., max_length=15, description="SĐT người nhận")
    dia_chi_giao: str = Field(..., max_length=500, description="Địa chỉ giao hàng")
    trang_thai: TrangThaiDonHangEnum = Field(
        default=TrangThaiDonHangEnum.CHO_XAC_NHAN,
        description="Trạng thái đơn hàng"
    )
    phi_van_chuyen: Decimal = Field(
        default=Decimal('0'),
        ge=0,
        description="Phí vận chuyển"
    )
    ghi_chu: Optional[str] = Field(None, max_length=1000, description="Ghi chú")

    model_config = ConfigDict(from_attributes=True)


class DonHangCreate(BaseModel):
    dia_chi_id: int = Field(..., description="ID địa chỉ giao hàng")
    phuong_thuc_thanh_toan: PhuongThucThanhToanEnum = Field(..., description="Phương thức thanh toán")
    ghi_chu: Optional[str] = Field(None, max_length=1000, description="Ghi chú đơn hàng")

class DonHangStatusUpdate(BaseModel):
    trang_thai: TrangThaiDonHangEnum = Field(..., description="Trạng thái mới của đơn hàng")
    ly_do: Optional[str] = Field(None, description="Lý do thay đổi trạng thái (nếu có)")

class OrderCancelRequest(BaseModel):
    ly_do: Optional[str] = Field(None, description="Lý do hủy đơn hàng")

class DonHangResponse(DonHangBase):
    id: int = Field(..., description="ID đơn hàng")
    ma_don_hang: str = Field(..., max_length=25, description="Mã đơn hàng")
    ngay_tao: datetime = Field(..., description="Ngày tạo")
    ngay_cap_nhat: datetime = Field(..., description="Ngày cập nhật")
    items: List[ChiTietDonHangResponse] = Field(
        default_factory=list,
        description="Danh sách sản phẩm trong đơn"
    )
    thanh_toan: Optional[ThanhToanResponse] = Field(None, description="Thông tin thanh toán")

    model_config = ConfigDict(from_attributes=True)