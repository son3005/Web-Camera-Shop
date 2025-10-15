from pydantic import BaseModel, Field
from typing import Optional

class DanhMucBase(BaseModel):
    ma_danh_muc: str = Field(..., max_length=10, description="Mã của danh mục")
    ten_danh_muc: str = Field(..., max_length=100, description="Tên của danh mục")

class DanhMucCreate(DanhMucBase):
    pass

class DanhMucUpdate(BaseModel):
    ma_danh_muc: Optional[str] = Field(None, max_length=10)
    ten_danh_muc: Optional[str] = Field(None, max_length=100)

class DanhMucResponse(DanhMucBase):
    id: int
    slug: str

    class Config:
        orm_mode = True