from pydantic import BaseModel, Field, validator
from typing import List, Optional
from decimal import Decimal

# Import schema từ file khác
from .HinhAnhSanPham import HinhAnhCreate, HinhAnhResponse

class BienTheBase(BaseModel):
    ma_sku: str = Field(..., max_length=120, description="Mã SKU định danh duy nhất cho biến thể")
    ten_bien_the: Optional[str] = Field(None, max_length=100, description="Tên của biến thể, ví dụ: 'Màu đen, 128GB'")
    gia: Decimal = Field(..., gt=0, description="Giá bán của biến thể")
    gia_khuyen_mai: Optional[Decimal] = Field(None, gt=0, description="Giá sau khi khuyến mãi")
    so_luong_ton: int = Field(..., ge=0, description="Số lượng tồn kho")

    @validator('gia_khuyen_mai')
    def gia_khuyen_mai_must_be_less_than_gia(cls, v, values, **kwargs):
        if v is not None and 'gia' in values and v >= values['gia']:
            raise ValueError('Giá khuyến mãi phải nhỏ hơn giá gốc')
        return v

class BienTheCreate(BienTheBase):
    hinh_anhs: Optional[List[HinhAnhCreate]] = Field([], description="Danh sách hình ảnh cho biến thể này")

class BienTheUpdate(BaseModel):
    ma_sku: Optional[str] = Field(None, max_length=120)
    ten_bien_the: Optional[str] = Field(None, max_length=100)
    gia: Optional[Decimal] = Field(None, gt=0)
    gia_khuyen_mai: Optional[Decimal] = Field(None, gt=0)
    so_luong_ton: Optional[int] = Field(None, ge=0)

class BienTheResponse(BienTheBase):
    id: int
    hinh_anhs: List[HinhAnhResponse] = []

    class Config:
        orm_mode = True