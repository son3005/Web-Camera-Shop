from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from ...models.enums import TrangThaiNhaCungCapEnum  # Thêm dòng này

class NhaCungCapBase(BaseModel):
    ma_nha_cung_cap: Optional[str] = Field(..., max_length=12, description="Mã nhà cung cấp")
    ten_nha_cung_cap: str = Field(..., max_length=100, description="Tên nhà cung cấp")
    dia_chi: Optional[str] = Field(None, max_length=500, description="Địa chỉ nhà cung cấp")
    so_dien_thoai: Optional[str] = Field(None, max_length=15, description="Số điện thoại nhà cung cấp")
    email: Optional[str] = Field(None, max_length=100, description="Email nhà cung cấp")
    nguoi_dai_dien: Optional[str] = Field(None, max_length=100, description="Người đại diện nhà cung cấp")
    tai_khoan_ngan_hang: Optional[str] = Field(None, max_length=50, description="Tài khoản ngân hàng nhà cung cấp")
    ten_ngan_hang: Optional[str] = Field(None, max_length=100, description="Tên ngân hàng nhà cung cấp")
    trang_thai: TrangThaiNhaCungCapEnum = Field(TrangThaiNhaCungCapEnum.KICH_HOAT, description="Trạng thái nhà cung cấp")  # Sửa thành Enum
    ghi_chu: Optional[str] = Field(None, description="Ghi chú về nhà cung cấp")
    
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)  # Thêm use_enum_values

class NhaCungCapCreate(BaseModel):
    # Bỏ trường ma_nha_cung_cap khỏi Create
    ten_nha_cung_cap: str = Field(..., max_length=100, description="Tên nhà cung cấp")
    dia_chi: Optional[str] = Field(None, max_length=500, description="Địa chỉ nhà cung cấp")
    so_dien_thoai: Optional[str] = Field(None, max_length=15, description="Số điện thoại nhà cung cấp")
    email: Optional[str] = Field(None, max_length=100, description="Email nhà cung cấp")
    nguoi_dai_dien: Optional[str] = Field(None, max_length=100, description="Người đại diện nhà cung cấp")
    tai_khoan_ngan_hang: Optional[str] = Field(None, max_length=50, description="Tài khoản ngân hàng nhà cung cấp")
    ten_ngan_hang: Optional[str] = Field(None, max_length=100, description="Tên ngân hàng nhà cung cấp")
    trang_thai: TrangThaiNhaCungCapEnum = Field(TrangThaiNhaCungCapEnum.KICH_HOAT, description="Trạng thái nhà cung cấp")
    ghi_chu: Optional[str] = Field(None, description="Ghi chú về nhà cung cấp")
    
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

class NhaCungCapUpdate(BaseModel):
    ten_nha_cung_cap: Optional[str] = Field(None, max_length=100, description="Tên nhà cung cấp")
    dia_chi: Optional[str] = Field(None, max_length=500, description="Địa chỉ nhà cung cấp")
    so_dien_thoai: Optional[str] = Field(None, max_length=15, description="Số điện thoại nhà cung cấp")
    email: Optional[str] = Field(None, max_length=100, description="Email nhà cung cấp")
    nguoi_dai_dien: Optional[str] = Field(None, max_length=100, description="Người đại diện nhà cung cấp")
    tai_khoan_ngan_hang: Optional[str] = Field(None, max_length=50, description="Tài khoản ngân hàng nhà cung cấp")
    ten_ngan_hang: Optional[str] = Field(None, max_length=100, description="Tên ngân hàng nhà cung cấp")
    trang_thai: Optional[TrangThaiNhaCungCapEnum] = Field(None, description="Trạng thái nhà cung cấp")  # Sửa thành Optional Enum
    ghi_chu: Optional[str] = Field(None, description="Ghi chú về nhà cung cấp")
    
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

class NhaCungCapDelete(BaseModel):
    message: str = Field(..., description="Thông báo kết quả xóa nhà cung cấp")
    
    model_config = ConfigDict(from_attributes=True)

class NhaCungCapResponse(NhaCungCapBase):
    id: int
    ngay_tao: Optional[datetime] = Field(None, description="Ngày tạo nhà cung cấp")
    ngay_cap_nhat: Optional[datetime] = Field(None, description="Ngày cập nhật nhà cung cấp")
    
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

class ListNhaCungCapResponse(BaseModel):
    nha_cung_caps: List[NhaCungCapResponse] = Field(
        default_factory=list,
        description="Danh sách nhà cung cấp"
    )
    
    model_config = ConfigDict(from_attributes=True)

class NhaCungCapPath(BaseModel):
    nha_cung_cap_id: int = Field(..., description="ID của nhà cung cấp")
    model_config = ConfigDict(from_attributes=True)