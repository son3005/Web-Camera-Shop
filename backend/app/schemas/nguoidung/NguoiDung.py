# /backend/app/schemas/nguoidung/NguoiDung.py

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import date, datetime

# --- FIX 1: Import Enums trực tiếp từ Model ---
from app.models.nguoidung.NguoiDung import VaiTroNguoiDung, TrangThaiNguoiDung

# ========================== SCHEMA REQUEST ==========================

class LoginRequest(BaseModel):
    """Dùng cho API đăng nhập"""
    email: EmailStr = Field(..., description="Email đăng nhập")
    mat_khau: str = Field(..., description="Mật khẩu")


class NguoiDungBase(BaseModel):
    """Các thuộc tính chung - Đã đồng bộ với Model"""
    email: EmailStr = Field(..., description="Email phải là duy nhất")
    ho_ten: str = Field(..., max_length=100, description="Họ và tên người dùng")
    so_dien_thoai: Optional[str] = Field(None, max_length=15, description="Số điện thoại")
    
    # --- Đã xóa 'ngay_sinh', 'gioi_tinh' và 'anh_dai_dien_url' vì không có trong Model ---


class NguoiDungCreate(NguoiDungBase):
    """Schema dùng khi đăng ký tài khoản"""
    mat_khau: str = Field(..., min_length=8, description="Mật khẩu phải có ít nhất 8 ký tự")
    xac_nhan_mat_khau: str = Field(..., description="Xác nhận lại mật khẩu")

    @validator("xac_nhan_mat_khau")
    def passwords_match(cls, v, values, **kwargs):
        if "mat_khau" in values and v != values["mat_khau"]:
            raise ValueError("Mật khẩu xác nhận không khớp")
        return v


class NguoiDungUpdate(BaseModel):
    """Schema dùng khi cập nhật hồ sơ người dùng"""
    ho_ten: Optional[str] = Field(None, max_length=100)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    # --- Đã xóa 'ngay_sinh', 'gioi_tinh' và 'anh_dai_dien_url' ---


# ========================== SCHEMA RESPONSE ==========================

class NguoiDungResponse(NguoiDungBase):
    """Schema phản hồi - Đã đồng bộ với Model"""
    id: int
    ma_nguoi_dung: str
    
    # --- FIX 1: Sử dụng Enum class trực tiếp từ Model ---
    vai_tro: VaiTroNguoiDung
    trang_thai: TrangThaiNguoiDung
    
    ngay_tao: datetime

    class Config:
        orm_mode = True
        use_enum_values = True # Chuyển enums thành string khi .dict()


# --- FIX 3: Thêm class này để sửa lỗi ImportError ---
class NguoiDungCoBanResponse(BaseModel):
    """Schema phản hồi rút gọn (id, họ tên)"""
    id: int
    ho_ten: str

    class Config:
        orm_mode = True