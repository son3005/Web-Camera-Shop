# /backend/app/schemas/Shared.py
from typing import List, TypeVar, Generic
from pydantic import BaseModel, ConfigDict, Field

# --- Import Enums ---
from ..models.enums import (
    TrangThaiSanPhamEnum,
    VaiTroNguoiDungEnum,
    TrangThaiNguoiDungEnum,
    TrangThaiDonHangEnum,
    TrangThaiThanhToanEnum,
    PhuongThucThanhToanEnum
)

ItemType = TypeVar('ItemType')

class PaginatedResponse(BaseModel, Generic[ItemType]):  # SỬA: GenericModel → BaseModel, Generic[T]
    """
    Schema chung cho mọi response dạng phân trang.
    """
    items: List[ItemType] = Field(..., description="Danh sách các mục trên trang này")
    page: int = Field(..., description="Số trang hiện tại")
    per_page: int = Field(..., description="Số mục trên mỗi trang")
    total_items: int = Field(..., description="Tổng số mục")
    total_pages: int = Field(..., description="Tổng số trang")

    model_config = ConfigDict(from_attributes=True)  # SỬA: model_config ở ngoài class Config


class TrangThaiUpdate(BaseModel):
    """
    Schema chung cho các request chỉ cập nhật 'trang_thai'
    """
    trang_thai: str = Field(..., description="Trạng thái mới")

    model_config = ConfigDict(from_attributes=True)