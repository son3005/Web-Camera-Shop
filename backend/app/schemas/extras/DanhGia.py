# /backend/app/schemas/danh_gia.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# (CẢI TIẾN) Import Enum từ model 'DanhGia.py'
from app.models.extras import TrangThaiDanhGia

# (CẢI TIẾN) Import schema NguoiDungCoBanResponse từ file 'nguoi_dung.py'
# (thay vì định nghĩa lại ở đây, như trong file bạn gửi)
from app.schemas.nguoidung import NguoiDungCoBanResponse 

# --- Schema cho Đánh giá ---

class DanhGiaCreate(BaseModel):
    """
    Schema khi người dùng tạo một đánh giá mới.
    """
    chi_tiet_don_hang_id: int = Field(..., description="ID của chi tiết đơn hàng được đánh giá")
    
    # Model DanhGia.py của bạn đã có CheckConstraint 1-5
    diem_danh_gia: int = Field(..., ge=1, le=5, description="Điểm đánh giá từ 1 đến 5")
    binh_luan: Optional[str] = Field(None, description="Nội dung bình luận")

class DanhGiaResponse(BaseModel):
    """
    Schema khi API trả về một đánh giá.
    """
    id: int
    diem_danh_gia: int
    binh_luan: Optional[str]
    ngay_tao: datetime
    trang_thai: TrangThaiDanhGia
    
    # Lồng thông tin người dùng
    nguoi_dung: NguoiDungCoBanResponse 

    class Config:
        orm_mode = True

class DanhGiaUpdate(BaseModel):
    """
    Schema cho Admin duyệt/cập nhật trạng thái đánh giá.
    """
    trang_thai: TrangThaiDanhGia