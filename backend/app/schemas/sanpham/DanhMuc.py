# /backend/app/schemas/DanhMuc.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class DanhMucBase(BaseModel):
    ma_danh_muc: str = Field(..., max_length=5, description="Mã của danh mục")
    ten_danh_muc: str = Field(..., max_length=100, description="Tên của danh mục")


class DanhMucCreate(DanhMucBase):
    pass


class DanhMucUpdate(BaseModel):
    ma_danh_muc: Optional[str] = Field(None, max_length=5)
    ten_danh_muc: Optional[str] = Field(None, max_length=100)

    model_config = ConfigDict(from_attributes=True)

class DanhMucDelete(BaseModel):
    id: int


class DanhMucResponse(DanhMucBase):
    id: int

    model_config = ConfigDict(from_attributes=True)