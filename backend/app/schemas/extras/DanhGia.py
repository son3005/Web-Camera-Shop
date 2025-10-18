# /backend/app/schemas/danh_gia.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Import Enum từ model DanhGia
from app.models.extras import TrangThaiDanhGia

# Import schema thu gọn của NguoiDung
from app.schemas.nguoidung import NguoiDungCoBanResponse 

class DanhGiaCreate(BaseModel):
    chi_tiet_don_hang_id: int = Field(..., description="ID của chi tiết đơn hàng được đánh giá")
    diem_danh_gia: int = Field(..., ge=1, le=5, description="Điểm đánh giá từ 1 đến 5")
    binh_luan: Optional[str] = Field(None, description="Nội dung bình luận")

class DanhGiaResponse(BaseModel):
    id: int
    diem_danh_gia: int
    binh_luan: Optional[str]
    ngay_tao: datetime
    trang_thai: TrangThaiDanhGia
    nguoi_dung: NguoiDungCoBanResponse 

    class Config:
        orm_mode = True

class DanhGiaUpdate(BaseModel):
    trang_thai: TrangThaiDanhGia