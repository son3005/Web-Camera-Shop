from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional

class CapDoBase(BaseModel):
    ma_cap_do: str = Field(..., max_length=5, description="Mã của cấp độ")
    ten_cap_do: str = Field(..., max_length=100, description="Tên của cấp độ")

class CapDoCreate(CapDoBase):
    pass

class CapDoUpdate(BaseModel):
    ma_cap_do: Optional[str] = Field(None, max_length=5)
    ten_cap_do: Optional[str] = Field(None, max_length=100)
    
    model_config = ConfigDict(from_attributes=True)

class CapDoDelete(BaseModel):
    id: int

class CapDoResponse(CapDoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class CapDoListResponse(BaseModel):
    """
    Schema cho API trả về danh sách cấp độ (có phân trang).
    Sửa lỗi: Thay đổi cấu trúc để khớp với các schema khác
    """
    data: List[CapDoResponse] = Field(..., description="Danh sách cấp độ")
    pagination: dict = Field(..., description="Thông tin phân trang (page, per_page, total, pages)")

    model_config = ConfigDict(from_attributes=True)