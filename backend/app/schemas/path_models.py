from pydantic import BaseModel, Field

class SanPhamPath(BaseModel):
    san_pham_id: int = Field(..., description="ID của sản phẩm")
    model_config = {"from_attributes": True}

class BienThePath(BaseModel):
    san_pham_id: int = Field(..., description="ID của sản phẩm")
    bien_the_id: int = Field(..., description="ID của biến thể")
    model_config = {"from_attributes": True}


class DanhMucPath(BaseModel):
    """
    Model để validate ID danh mục từ URL path.
    """
    danh_muc_id: int = Field(..., description="ID của danh mục")

class ThuongHieuPath(BaseModel):
    """
    Model để validate ID thương hiệu từ URL path.
    """
    thuong_hieu_id: int = Field(..., description="ID của thương hiệu")