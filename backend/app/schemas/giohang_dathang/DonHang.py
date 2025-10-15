from pydantic import BaseModel, Field
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

# Import các schema và enum cần thiết
from ..Shared import TrangThaiDonHangEnum, PhuongThucThanhToanEnum
from .ThanhToan import ThanhToanResponse

class ChiTietDonHangResponse(BaseModel):
    """
    Schema trả về thông tin của một mục trong đơn hàng.
    Thông tin này được "đóng băng" tại thời điểm mua.
    """
    id: int
    sku_luc_mua: str
    ten_san_pham_luc_mua: str
    ten_bien_the_luc_mua: Optional[str]
    don_gia_luc_mua: Decimal
    so_luong: int

    class Config:
        orm_mode = True

class DonHangBase(BaseModel):
    """Schema cơ sở cho đơn hàng, chứa thông tin giao hàng."""
    ten_nguoi_nhan: str = Field(..., max_length=100)
    so_dien_thoai_nhan: str = Field(..., max_length=15)
    dia_chi_giao_hang: str = Field(..., max_length=500, description="Địa chỉ đầy đủ dưới dạng text")
    ghi_chu: Optional[str] = None

class DonHangCreate(BaseModel):
    """
    Schema dùng khi người dùng tiến hành đặt hàng.
    Backend sẽ tự động lấy sản phẩm từ giỏ hàng của người dùng.
    """
    dia_chi_id: int = Field(..., description="ID của địa chỉ đã lưu mà người dùng chọn để giao hàng")
    phuong_thuc_thanh_toan: PhuongThucThanhToanEnum
    ghi_chu: Optional[str] = None
    # Các thông tin về giá trị đơn hàng (tạm tính, tổng tiền) sẽ do backend tính toán để đảm bảo an toàn.

class DonHangUpdate(BaseModel):
    """Schema dành cho admin cập nhật trạng thái đơn hàng."""
    trang_thai: TrangThaiDonHangEnum

class DonHangResponse(DonHangBase):
    """Schema trả về thông tin chi tiết đầy đủ của một đơn hàng."""
    id: int
    ma_don_hang: str
    nguoi_dung_id: int
    trang_thai: TrangThaiDonHangEnum
    
    # Giá trị tiền tệ
    tam_tinh: Decimal
    phi_van_chuyen: Decimal
    giam_gia: Decimal
    tong_tien: Decimal

    ngay_tao: datetime
    ngay_cap_nhat: datetime
    
    # Lồng thông tin chi tiết
    items: List[ChiTietDonHangResponse] = []
    thanh_toan: Optional[ThanhToanResponse] = None

    class Config:
        orm_mode = True