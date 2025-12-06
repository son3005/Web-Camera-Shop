# /backend/app/schemas/path_models.py
from pydantic import BaseModel, Field

class SanPhamPath(BaseModel):
    """Model để validate ID sản phẩm từ URL path."""
    san_pham_id: int = Field(..., description="ID của sản phẩm")
    model_config = {"from_attributes": True}

class BienThePath(BaseModel):
    """Model để validate ID sản phẩm và biến thể từ URL path."""
    san_pham_id: int = Field(..., description="ID của sản phẩm")
    bien_the_id: int = Field(..., description="ID của biến thể")
    model_config = {"from_attributes": True}

class HinhAnhPath(BaseModel):
    """Model để validate ID sản phẩm, biến thể và ảnh từ URL path."""
    san_pham_id: int = Field(..., description="ID của sản phẩm")
    bien_the_id: int = Field(..., description="ID của biến thể")
    hinh_anh_id: int = Field(..., description="ID của ảnh")
    model_config = {"from_attributes": True}

class DanhMucPath(BaseModel):
    """Model để validate ID danh mục từ URL path."""
    danh_muc_id: int = Field(..., description="ID của danh mục")
    model_config = {"from_attributes": True}

class ThuongHieuPath(BaseModel):
    """Model để validate ID thương hiệu từ URL path."""
    thuong_hieu_id: int = Field(..., description="ID của thương hiệu")
    model_config = {"from_attributes": True}


class DeleteResponse(BaseModel):
    """Model cho response khi xóa thành công."""
    message: str