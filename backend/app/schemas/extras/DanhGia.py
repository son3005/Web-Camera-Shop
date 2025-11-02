# /backend/app/schemas/danh_gia.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

from ...models.enums import TrangThaiDanhGiaEnum
from ..nguoidung.NguoiDung import NguoiDungCoBanResponse  # Đường dẫn đúng
from ..sanpham import SanPhamPublic  # Nếu cần trả về sản phẩm


class DanhGiaBase(BaseModel):
    chi_tiet_don_hang_id: int = Field(
        ..., 
        description="ID chi tiết đơn hàng (unique per order item)"
    )
    san_pham_id: int = Field(..., description="ID sản phẩm được đánh giá")
    nguoi_dung_id: int = Field(..., description="ID người dùng đánh giá")
    diem_danh_gia: int = Field(
        ..., 
        ge=1, 
        le=5, 
        description="Điểm đánh giá từ 1 đến 5"
    )
    binh_luan: Optional[str] = Field(
        None, 
        max_length=2000, 
        description="Nội dung đánh giá (Text → max 2000 ký tự)"
    )
    trang_thai: TrangThaiDanhGiaEnum = Field(
        default=TrangThaiDanhGiaEnum.DA_DUYET,
        description="Trạng thái duyệt đánh giá"
    )

    model_config = ConfigDict(from_attributes=True)


class DanhGiaCreate(BaseModel):
    """
    Dùng khi người dùng gửi đánh giá.
    Backend sẽ tự gán `nguoi_dung_id` từ JWT.
    """
    chi_tiet_don_hang_id: int = Field(..., description="ID chi tiết đơn hàng đã mua")
    diem_danh_gia: int = Field(..., ge=1, le=5)
    binh_luan: Optional[str] = Field(None, max_length=2000)

    model_config = ConfigDict(from_attributes=True)


class DanhGiaUpdate(BaseModel):
    """Dùng cho admin duyệt hoặc user chỉnh sửa"""
    diem_danh_gia: Optional[int] = Field(None, ge=1, le=5)
    binh_luan: Optional[str] = Field(None, max_length=2000)
    trang_thai: Optional[TrangThaiDanhGiaEnum] = None

    model_config = ConfigDict(from_attributes=True)


class DanhGiaResponse(DanhGiaBase):
    id: int
    ngay_tao: datetime
    ngay_cap_nhat: datetime
    nguoi_dung: NguoiDungCoBanResponse
    # san_pham: Optional[SanPhamPublic] = None  # Nếu cần trả thêm

    model_config = ConfigDict(from_attributes=True)