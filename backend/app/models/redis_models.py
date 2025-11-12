from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field, validator
from decimal import Decimal
from .enums import PhuongThucThanhToanEnum, TrangThaiThanhToanEnum

class ChiTietDonHangRedis(BaseModel):
    id_bien_the: int = Field(..., description="ID biến thể sản phẩm")
    so_luong: int = Field(..., ge=1, description="Số lượng")
    # REMOVE: don_gia field since frontend doesn't send it

class DonHangAoCreate(BaseModel):
    id_nguoi_dung: Optional[int] = Field(None, description="ID người dùng")
    id_dia_chi: Optional[int] = Field(None, description="ID địa chỉ giao hàng")
    ten_nguoi_nhan: str = Field(..., max_length=50, description="Tên người nhận")
    so_dien_thoai_nguoi_nhan: str = Field(..., max_length=15, description="SĐT người nhận")
    dia_chi_giao: str = Field(..., max_length=500, description="Địa chỉ giao hàng")
    phuong_thuc_thanh_toan: PhuongThucThanhToanEnum = Field(..., description="Phương thức thanh toán")
    phi_van_chuyen: Decimal = Field(default=2000, ge=0, description="Phí vận chuyển")
    ghi_chu: Optional[str] = Field(None, max_length=1000, description="Ghi chú")
    items: List[ChiTietDonHangRedis] = Field(..., description="Danh sách sản phẩm")

class DonHangAoResponse(BaseModel):
    """Model response cho đơn hàng ảo, không kế thừa từ Create"""
    id: str = Field(..., description="ID đơn hàng ảo (UUID)")
    id_nguoi_dung: Optional[int] = Field(None, description="ID người dùng")
    id_dia_chi: Optional[int] = Field(None, description="ID địa chỉ giao hàng")
    ten_nguoi_nhan: str = Field(..., description="Tên người nhận")
    so_dien_thoai_nguoi_nhan: str = Field(..., description="SĐT người nhận")
    dia_chi_giao: str = Field(..., description="Địa chỉ giao hàng")
    phuong_thuc_thanh_toan: PhuongThucThanhToanEnum = Field(..., description="Phương thức thanh toán")
    phi_van_chuyen: Decimal = Field(..., description="Phí vận chuyển")
    ghi_chu: Optional[str] = Field(None, description="Ghi chú")
    thoi_gian_tao: datetime = Field(..., description="Thời gian tạo")
    thoi_gian_het_han: datetime = Field(..., description="Thời gian hết hạn")
    tong_tien: Decimal = Field(..., description="Tổng tiền")
    trang_thai: str = Field(default="cho_thanh_toan", description="Trạng thái đơn hàng")
    payment_url: Optional[str] = Field(None, description="URL thanh toán PayOS")
    ma_giao_dich_payos: Optional[str] = Field(None, description="Mã giao dịch PayOS")
    items_enriched: List[Dict[str, Any]] = Field(default_factory=list, description="Danh sách sản phẩm đầy đủ thông tin")
    
    model_config = ConfigDict(from_attributes=True)