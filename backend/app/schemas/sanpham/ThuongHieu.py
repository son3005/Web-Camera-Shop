import re
from pydantic import BaseModel, Field, validator
from typing import Optional

class ThuongHieuBase(BaseModel):
    ma_thuong_hieu: str = Field(..., max_length=5, description="Mã của thương hiệu")
    ten_thuong_hieu: str = Field(..., max_length=100, description="Tên của thương hiệu")
    logo_url: Optional[str] = Field(None, max_length=512, description="URL logo của thương hiệu")
    
    @validator('logo_url', pre=True, always=True)
    def validate_logo_url(cls, v):
        if v is None:
            return v
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(pattern, v):
            raise ValueError('Invalid logo URL')
        return v

class ThuongHieuCreate(ThuongHieuBase):
    public_id: Optional[str] = Field(None, description="id của logo trên Cloudinary")

class ThuongHieuUpdate(BaseModel):
    ma_thuong_hieu: Optional[str] = Field(None, max_length=5)
    ten_thuong_hieu: Optional[str] = Field(None, max_length=100)
    logo_url: Optional[str] = Field(None, max_length=512)

class ThuongHieuDelete(BaseModel):
    id: int

class ThuongHieuResponse(ThuongHieuBase):
    id: int

    class Config:
        orm_mode = True