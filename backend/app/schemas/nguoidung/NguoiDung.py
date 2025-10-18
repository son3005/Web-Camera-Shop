from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List
from datetime import date, datetime

# Import enums and schemas khác
from app.schemas.Shared import VaiTroNguoiDungEnum, TrangThaiNguoiDungEnum, GioiTinhEnum
from .DiaChi import DiaChiResponse

class NguoiDungBase(BaseModel):
    email: EmailStr = Field(..., description="Email phải là duy nhất")
    ho_ten: str = Field(..., max_length=100, description="Họ và tên người dùng")
    so_dien_thoai: Optional[str] = Field(None, max_length=15, description="Số điện thoại")
    ngay_sinh: Optional[date] = Field(None, description="Ngày sinh")
    gioi_tinh: Optional[GioiTinhEnum] = Field(None, description="Giới tính")
    anh_dai_dien_url: Optional[str] = Field(None, max_length=512, description="URL ảnh đại diện")

class NguoiDungCreate(NguoiDungBase):
    mat_khau: str = Field(..., min_length=8, description="Mật khẩu phải có ít nhất 8 ký tự")
    xac_nhan_mat_khau: str = Field(..., description="Xác nhận lại mật khẩu")

    @validator('xac_nhan_mat_khau')
    def passwords_match(cls, v, values, **kwargs):
        if 'mat_khau' in values and v != values['mat_khau']:
            raise ValueError('Mật khẩu xác nhận không khớp')
        return v

class NguoiDungUpdate(BaseModel):
    ho_ten: Optional[str] = Field(None, max_length=100)
    so_dien_thoai: Optional[str] = Field(None, max_length=15)
    ngay_sinh: Optional[date] = None
    gioi_tinh: Optional[GioiTinhEnum] = None
    anh_dai_dien_url: Optional[str] = Field(None, max_length=512)

class NguoiDungResponse(NguoiDungBase):
    id: int
    ma_nguoi_dung: str
    vai_tro: VaiTroNguoiDungEnum
    trang_thai: TrangThaiNguoiDungEnum
    ngay_tao: datetime
    dia_chis: List[DiaChiResponse] = [] # Giữ nguyên

    class Config:
        orm_mode = True


# Định nghĩa schema thu gọn
class NguoiDungCoBanResponse(BaseModel):
    id: int
    ho_ten: str = Field(..., description="Họ và tên người dùng")
    anh_dai_dien_url: Optional[str] = None

    class Config:
        orm_mode = True