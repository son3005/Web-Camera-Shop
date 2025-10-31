# /backend/app/schemas/danh_gia.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from ...models.enums import TrangThaiDanhGiaEnum
from ..nguoidung import NguoiDungCoBanResponse 

class DanhGiaBase(BaseModel):
    diem_danh_gia: int = Field(..., description="Điểm từ 1-5 (DB đã ràng buộc)")
    binh_luan: Optional[str] = Field(None, description="Bình luận của người dùng")
    trang_thai: TrangThaiDanhGiaEnum = TrangThaiDanhGiaEnum.DA_DUYET

class DanhGiaCreate(DanhGiaBase):
    chi_tiet_don_hang_id: int = Field(..., description="ID chi tiết đơn hàng liên quan")
    san_pham_id: int = Field(..., description="ID sản phẩm được đánh giá")

class DanhGiaUpdate(BaseModel):
    diem_danh_gia: Optional[int] = Field(None, ge=1, le=5)
    binh_luan: Optional[str] = None
    trang_thai: Optional[TrangThaiDanhGiaEnum] = None
    ngay_cap_nhat: Optional[datetime] = None

class DanhGiaResponse(DanhGiaBase):
    id: int
    chi_tiet_don_hang_id: int
    san_pham_id: int
    nguoi_dung: NguoiDungCoBanResponse
    ngay_tao: datetime
    ngay_cap_nhat: datetime

    class Config:
        orm_mode = True