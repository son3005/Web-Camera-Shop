# /backend/app/schemas/Shared.py
from typing import List, TypeVar, Generic
from pydantic import BaseModel, Field
from pydantic.generics import GenericModel

# --- (SỬA) Import Enums từ file trung lập ---
from app.models.enums import (
    TrangThaiSanPhamEnum,
    VaiTroNguoiDungEnum,
    TrangThaiNguoiDungEnum,
    GioiTinhEnum,
    TrangThaiDonHangEnum,
    TrangThaiThanhToanEnum,
    PhuongThucThanhToanEnum
)


# Dùng lại cho tất cả các loại phân trang
ItemType = TypeVar('ItemType')

class PaginatedResponse(GenericModel, Generic[ItemType]):
    """
    Schema chung cho mọi response dạng phân trang.
    """
    items: List[ItemType] = Field(..., description="Danh sách các mục trên trang này")
    page: int = Field(..., description="Số trang hiện tại")
    per_page: int = Field(..., description="Số mục trên mỗi trang")
    total_items: int = Field(..., description="Tổng số mục")
    total_pages: int = Field(..., description="Tổng số trang")

    class Config:
        orm_mode = True # Vẫn giữ orm_mode cho Pydantic v1

class TrangThaiUpdate(BaseModel):
    """
    Schema chung cho các request chỉ cập nhật 'trang_thai'
    (Sẽ được dùng trong nhiều route, ví dụ: sanpham_service)
    """
    trang_thai: str = Field(..., description="Trạng thái mới")