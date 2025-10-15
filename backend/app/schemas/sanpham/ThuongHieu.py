from pydantic import BaseModel, Field
from typing import Optional

class ThuongHieuBase(BaseModel):
    ma_thuong_hieu: str = Field(..., max_length=20, description="Mã của thương hiệu")
    ten_thuong_hieu: str = Field(..., max_length=100, description="Tên của thương hiệu")
    logo_url: Optional[str] = Field(None, max_length=512, description="URL logo của thương hiệu")

class ThuongHieuCreate(ThuongHieuBase):
    pass

class ThuongHieuUpdate(BaseModel):
    ma_thuong_hieu: Optional[str] = Field(None, max_length=20)
    ten_thuong_hieu: Optional[str] = Field(None, max_length=100)
    logo_url: Optional[str] = Field(None, max_length=512)

class ThuongHieuResponse(ThuongHieuBase):
    id: int
    slug: str

    class Config:
        orm_mode = True