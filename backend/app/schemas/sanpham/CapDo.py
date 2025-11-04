from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class CapDoBase(BaseModel):
    ma_cap_do: str = Field(...,max_length=5, description="Mã của cấp độ")
    ten_cap_do: str = Field(...,max_length=100, description="Tên của cấp độ")

class CapDoCreate(CapDoBase):
    pass

class CapDoUpdate(BaseModel):
    ma_cap_do: Optional[str] = Field(None,max_length=5)
    ten_cap_do: Optional[str] = Field(None, max_length=100)

class CapDoDelete(BaseModel):
    id:int

class CapDoRespone(CapDoBase):
    id: int

    model_config = ConfigDict(from_attributes = True)