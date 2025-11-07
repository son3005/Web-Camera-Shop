# /backend/app/models/draft_order.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from decimal import Decimal
from datetime import datetime

class DraftOrderItem(BaseModel):
    bien_the_san_pham_id: int
    ten_san_pham: str
    ten_bien_the: str
    gia_ban: Decimal
    so_luong: int
    hinh_anh: Optional[str] = None

class DraftOrder(BaseModel):
    session_id: str
    user_id: Optional[int] = None
    items: List[DraftOrderItem] = []
    dia_chi_id: Optional[int] = None
    ten_nguoi_nhan: Optional[str] = None
    so_dien_thoai_nguoi_nhan: Optional[str] = None
    dia_chi_giao: Optional[str] = None
    phuong_thuc_thanh_toan: Optional[str] = None
    phi_van_chuyen: Decimal = Decimal('0')
    ghi_chu: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    tong_tien: Decimal = Decimal('0')