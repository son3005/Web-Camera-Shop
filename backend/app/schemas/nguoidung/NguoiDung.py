# /backend/app/schemas/nguoidung/NguoiDung.py

from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import date, datetime


from ...models.enums import VaiTroNguoiDungEnum, TrangThaiNguoiDungEnum




class LoginRequest(BaseModel):
    """Dùng cho API đăng nhập"""
    email: EmailStr = Field(..., description="Email đăng nhập")
    mat_khau: str = Field(..., description="Mật khẩu")


class NguoiDungBase(BaseModel):
    """Các thuộc tính chung - Đã đồng bộ với Model"""
    email: EmailStr = Field(..., description="Email phải là duy nhất")
    ho_ten: str = Field(..., max_length=100, description="Họ và tên người dùng")
    so_dien_thoai: Optional[str] = Field(None, max_length=15, description="Số điện thoại")
    


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
    email: Optional[EmailStr] = None

class NguoiDungUpdateMatKhau(BaseModel):
    mat_khau: str = Field(..., min_length=8, description="Mật khẩu phải có ít nhất 8 ký tự")
    xac_nhan_mat_khau: str = Field(..., description="Xác nhận lại mật khẩu")

    @validator("xac_nhan_mat_khau")
    def passwords_match(cls, v, values, **kwargs):
        if "mat_khau" in values and v != values["mat_khau"]:
            raise ValueError("Mật khẩu xác nhận không khớp")
        return v
    

class NguoiDungResponse(NguoiDungBase):
    id: int
    ma_nguoi_dung: str
    vai_tro: VaiTroNguoiDungEnum
    so_dien_thoai: Optional[str] = None
    trang_thai: TrangThaiNguoiDungEnum
    ngay_tao: datetime
    lan_cuoi_dang_nhap: Optional[datetime] = None  # Thêm nếu cần

    class Config:
        orm_mode = True
        use_enum_values = True


class NguoiDungCoBanResponse(BaseModel):
    """Schema phản hồi rút gọn (id, họ tên)"""
    id: int
    ho_ten: str

    class Config:
        orm_mode = True