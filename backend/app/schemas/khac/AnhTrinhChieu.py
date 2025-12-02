from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from ...models.enums import TrangThaiAnhTrinhChieuEnum
class AnhTrinhChieuBase(BaseModel):
    tieu_de: str = Field(..., max_length=200, description="Tiêu đề của ảnh trình chiếu")
    hinh_anh_url: str = Field(..., max_length=255, description="URL hình ảnh của ảnh trình chiếu")
    public_id: str = Field(..., max_length=255, description="Public ID của hình ảnh trên dịch vụ lưu trữ")
    lien_ket: Optional[str] = Field(None, max_length=255, description="Liên kết khi người dùng nhấp vào ảnh trình chiếu")
    vi_tri: int = Field(..., description="Vị trí hiển thị của ảnh trình chiếu")
    trang_thai: TrangThaiAnhTrinhChieuEnum = Field(..., description="Trạng thái hiển thị của ảnh trình chiếu")

class AnhTrinhChieuCreate(AnhTrinhChieuBase):
    pass

class AnhTrinhChieuUpdate(BaseModel):
    tieu_de: Optional[str] = Field(None, max_length=200, description="Tiêu đề của ảnh trình chiếu")
    lien_ket: Optional[str] = Field(None, max_length=255, description="Liên kết khi người dùng nhấp vào ảnh trình chiếu")
    vi_tri: Optional[int] = Field(None, description="Vị trí hiển thị của ảnh trình chiếu")
    trang_thai: Optional[TrangThaiAnhTrinhChieuEnum] = Field(None, description="Trạng thái hiển thị của ảnh trình chiếu")

    model_config = ConfigDict(from_attributes=True)

class AnhTrinhChieuDelete(AnhTrinhChieuBase):
    anh_trinh_chieu_id: int = Field(..., description="ID của ảnh trình chiếu cần xóa")

class AnhTrinhChieuResponsePrivate(AnhTrinhChieuBase):
    anh_trinh_chieu_id: int = Field(..., description="ID của ảnh trình chiếu")

    model_config = ConfigDict(from_attributes=True)

class AnhTrinhChieuResponsePublic(BaseModel):
    tieu_de: str = Field(..., description="Tiêu đề của ảnh trình chiếu")
    hinh_anh_url: str = Field(..., description="URL hình ảnh của ảnh trình chiếu")
    lien_ket: Optional[str] = Field(None, description="Liên kết khi người dùng nhấp vào ảnh trình chiếu")
    vi_tri: int = Field(..., description="Vị trí hiển thị của ảnh trình chiếu")
    model_config = ConfigDict(from_attributes=True)

class DanhSachAnhTrinhChieuResponsePrivate(BaseModel):
    anh_trinh_chieus: List[AnhTrinhChieuResponsePrivate] = Field(
        ..., description="Danh sách các ảnh trình chiếu"
    )

class DanhSachAnhTrinhChieuResponsePublic(BaseModel):
    anh_trinh_chieus: List[AnhTrinhChieuResponsePublic] = Field(
        ..., description="Danh sách các ảnh trình chiếu"
    )

    model_config = ConfigDict(from_attributes=True)