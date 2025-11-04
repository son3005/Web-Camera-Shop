# /backend/app/schemas/HinhAnhSanPham.py
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Any, Optional
import re


class HinhAnhBase(BaseModel):
    url: str = Field(..., description="URL của hình ảnh")
    
    alt_text: Optional[str] = Field(None, max_length=200)
    thu_tu: Optional[int] = Field(None)
    la_anh_dai_dien: bool = Field(False, description="Có phải là ảnh đại diện không")
    model_config = ConfigDict(from_attributes=True)

    @field_validator('url')
    @classmethod
    def validate_url(cls, v: str) -> str:
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(pattern, v):
            raise ValueError('Invalid URL format')
        return v

   

class HinhAnhCreate(HinhAnhBase):
    public_id: str = Field(..., max_length=255)
    pass


class HinhAnhUpdate(BaseModel):
    id: Optional[int] = Field(None)
    url: Optional[str] = Field(None)
    public_id: Optional[str] = Field(None, max_length=255)
    thu_tu: Optional[int] = Field(None)
    alt_text: Optional[str] = Field(None, max_length=200)
    la_anh_dai_dien: Optional[bool] = None
    file: Any = Field(None, description="File ảnh mới (chỉ dùng cho frontend)")

    @field_validator('url')
    @classmethod
    def validate_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(pattern, v):
            raise ValueError('Invalid URL format')
        return v



class HinhAnhDelete(BaseModel):
    id: int


class HinhAnhResponse(HinhAnhBase):
    id: int
    bien_the_id: int
