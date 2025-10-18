# app/schemas/HinhAnhSanPham.py
from pydantic import BaseModel, Field
from typing import Optional

class HinhAnhBase(BaseModel):
    url: str = Field(..., max_length=512, description="URL của hình ảnh")
    public_id: str = Field(..., max_length=255, description="ID của ảnh trên Cloudinary")
    alt_text: Optional[str] = Field(None, max_length=200, description="Văn bản thay thế cho SEO")
    la_anh_dai_dien: bool = Field(False, description="Là ảnh đại diện cho biến thể?")

class HinhAnhCreate(HinhAnhBase):
    pass

class HinhAnhUpdate(BaseModel):
    url: Optional[str] = Field(None, max_length=512)
    public_id: Optional[str] = Field(None, max_length=255)
    alt_text: Optional[str] = Field(None, max_length=200)
    la_anh_dai_dien: Optional[bool] = None

class HinhAnhResponse(HinhAnhBase):
    id: int
    class Config:
        orm_mode = True