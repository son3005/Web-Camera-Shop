# /backend/app/schemas/ThuongHieu.py
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional
import re


class ThuongHieuBase(BaseModel):
    ma_thuong_hieu: str = Field(..., max_length=5, description="Mã của thương hiệu")
    ten_thuong_hieu: str = Field(..., max_length=100, description="Tên của thương hiệu")
    logo_url: Optional[str] = Field(None, max_length=512, description="URL logo")

    model_config = ConfigDict(from_attributes=True)  # Thêm vào base

    @field_validator('logo_url')
    @classmethod
    def validate_logo_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(pattern, v):
            raise ValueError('URL logo không hợp lệ')
        return v


class ThuongHieuCreate(ThuongHieuBase):
    public_id: Optional[str] = Field(None, description="ID logo trên Cloudinary")


class ThuongHieuUpdate(BaseModel):
    ma_thuong_hieu: Optional[str] = Field(None, max_length=5)
    ten_thuong_hieu: Optional[str] = Field(None, max_length=100)
    logo_url: Optional[str] = Field(None, max_length=512)

    model_config = ConfigDict(from_attributes=True)


class ThuongHieuDelete(BaseModel):
    id: int


# 🔽 THÊM CLASS NÀY VÀO CUỐI FILE 🔽
class ThuongHieuResponse(ThuongHieuBase):
    """
    Schema trả về thông tin chi tiết của Thương hiệu.
    """
    id: int
    public_id: Optional[str] = Field(None, description="ID logo trên Cloudinary")
    
    # Kế thừa model_config từ ThuongHieuBase
    # model_config = ConfigDict(from_attributes=True) # Đã có trong Base

class ThuongHieuListResponse(BaseModel):
    """
    Schema cho API trả về danh sách thương hiệu (có phân trang).
    """
    data: List[ThuongHieuResponse]
    pagination: dict = Field(..., description="Thông tin phân trang (page, per_page, total, pages)")

    model_config = ConfigDict(from_attributes=True)