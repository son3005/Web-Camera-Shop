# /backend/app/schemas/nguoidung/NguoiDung.py
from pydantic import BaseModel, Field, EmailStr, field_validator, ConfigDict
from typing import Optional
from datetime import datetime

from ...models.enums import VaiTroNguoiDungEnum, TrangThaiNguoiDungEnum


class LoginRequest(BaseModel):
    """Dùng cho API đăng nhập"""
    email: EmailStr = Field(..., description="Email đăng nhập")
    mat_khau: str = Field(..., description="Mật khẩu")


class NguoiDungBase(BaseModel):
    email: EmailStr = Field(..., description="Email phải là duy nhất")
    ho_ten: str = Field(..., max_length=100, description="Họ và tên người dùng")
    so_dien_thoai: Optional[str] = Field(None, max_length=15, description="Số điện thoại")


class NguoiDungCreate(NguoiDungBase):
    mat_khau: str = Field(..., min_length=8, description="Mật khẩu phải có ít nhất 8 ký tự")


class NguoiDungUpdate(BaseModel):
    ho_ten: Optional[str] = Field(None, max_length=100)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = None

    model_config = ConfigDict(from_attributes=True)


class NguoiDungUpdateMatKhau(BaseModel):
    mat_khau_cu: str = Field(..., min_length=8, description="Mật khẩu mới")
    mat_khau_moi: str = Field(..., min_length=8, description="Xác nhận lại mật khẩu")


class NguoiDungResponse(NguoiDungBase):
    id: int
    ma_nguoi_dung: str
    vai_tro: VaiTroNguoiDungEnum
    so_dien_thoai: Optional[str] = None
    trang_thai: TrangThaiNguoiDungEnum
    ngay_tao: datetime
    lan_cuoi_dang_nhap: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True,
        use_enum_values=True  # Xuất giá trị enum dưới dạng string
    )


class NguoiDungCoBanResponse(BaseModel):
    """Schema phản hồi rút gọn (id, họ tên)"""
    id: int
    ho_ten: str

    model_config = ConfigDict(from_attributes=True)