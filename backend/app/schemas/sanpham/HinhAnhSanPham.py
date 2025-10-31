# app/schemas/HinhAnhSanPham.py
from pydantic import BaseModel, Field, HttpUrl, validator
from typing import Optional


class HinhAnhBase(BaseModel):
    url: str = Field(..., max_length=512, description="URL của hình ảnh")
    public_id: str = Field(..., max_length=255)
    alt_text: Optional[str] = Field(None, max_length=200)
    la_anh_dai_dien: bool = Field(False, description="Có phải là ảnh đại diện không")
    
    @validator('url')
    def validate_url(cls, v):
        # Kiểm tra URL hợp lệ
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(pattern, v):
            raise ValueError('Invalid URL format')
        return v

    class Config:
        from_attributes = True
    

class HinhAnhCreate(HinhAnhBase):
    pass
class HinhAnhUpdate(BaseModel):
    url: Optional[str] = Field(None, max_length=512)
    public_id: Optional[str] = Field(None, max_length=255)
    alt_text: Optional[str] = Field(None, max_length=200)
    la_anh_dai_dien: Optional[bool] = None

    @validator('url')
    def validate_url(cls, v):
        # Kiểm tra URL hợp lệ
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(pattern, v):
            raise ValueError('Invalid URL format')
        return v

    class Config:
        from_attributes = True

class HinhAnhDelete(BaseModel):
    id: int

class HinhAnhResponse(HinhAnhBase):
    id: int
    bien_the_id: int

    class Config:
        orm_mode = True