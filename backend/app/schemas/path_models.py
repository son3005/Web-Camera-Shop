from pydantic import BaseModel, Field

class SanPhamPath(BaseModel):
    san_pham_id: int = Field(..., description="ID của sản phẩm")
    model_config = {"from_attributes": True}

class BienThePath(BaseModel):
    san_pham_id: int = Field(..., description="ID của sản phẩm")
    bien_the_id: int = Field(..., description="ID của biến thể")
    model_config = {"from_attributes": True}