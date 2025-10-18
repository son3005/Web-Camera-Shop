# /backend/app/schemas/sanpham.py

from pydantic import BaseModel, Field, root_validator
from typing import List, Optional, Any, Dict
from datetime import datetime
from decimal import Decimal

# Import các thành phần để tính toán tóm tắt
from sqlalchemy import func
from app.models.extras import DanhGia, TrangThaiDanhGia 
from app.models.sanpham import SanPham

# Import các schema liên quan
from app.schemas.Shared import TrangThaiSanPhamEnum
from .DanhMuc import DanhMucResponse
from .ThuongHieu import ThuongHieuResponse
from .BienTheSanPham import BienTheCreate, BienTheResponse

class SanPhamBase(BaseModel):
    ten_san_pham: str = Field(..., max_length=200)
    mo_ta: Optional[str] = None
    thong_so_ky_thuat: Optional[Dict[str, Any]] = None
    trang_thai: TrangThaiSanPhamEnum = TrangThaiSanPhamEnum.DANG_BAN

class SanPhamCreate(SanPhamBase):
    danh_muc_id: int
    thuong_hieu_id: int
    cac_bien_the: List[BienTheCreate] = Field(..., min_items=1)

class SanPhamUpdate(BaseModel):
    ten_san_pham: Optional[str] = Field(None, max_length=200)
    mo_ta: Optional[str] = None
    thong_so_ky_thuat: Optional[Dict[str, Any]] = None
    trang_thai: Optional[TrangThaiSanPhamEnum] = None
    danh_muc_id: Optional[int] = None
    thuong_hieu_id: Optional[int] = None
    cac_bien_the: Optional[List[Dict[str, Any]]] = None # Cho phép logic sync
    
class TrangThaiUpdate(BaseModel):
    trang_thai: TrangThaiSanPhamEnum

class SanPhamResponse(SanPhamBase):
    """
    Schema chi tiết sản phẩm, đã thêm tóm tắt đánh giá.
    """
    id: int
    ma_san_pham: str
    slug: str
    ngay_tao: datetime
    danh_muc: DanhMucResponse
    thuong_hieu: ThuongHieuResponse
    cac_bien_the: List[BienTheResponse] = []
    review_count: int = Field(0, description="Tổng số lượng đánh giá ĐÃ DUYỆT")
    average_rating: Optional[float] = Field(None, description="Rating trung bình (chỉ tính đánh giá ĐÃ DUYỆT)")

    class Config:
        orm_mode = True
        arbitrary_types_allowed = True 

    # logic tự động tính toán
    @root_validator(pre=False, skip_on_failure=True)
    def calculate_review_summary(cls, values):
        product_obj = values.get('__obj__') 
        
        if not product_obj or not hasattr(product_obj, 'danh_gias'):
            return values 
        approved_reviews_query = product_obj.danh_gias.filter(
            DanhGia.trang_thai == TrangThaiDanhGia.DA_DUYET
        )
        
        count = approved_reviews_query.count()
        values['review_count'] = count
        
        if count > 0:
            avg_rating = approved_reviews_query.with_entities(
                func.avg(DanhGia.diem_danh_gia)
            ).scalar()
            values['average_rating'] = round(avg_rating, 1) if avg_rating else None
        else:
            values['average_rating'] = None

        return values

# Cập nhật SanPhamPublic
class SanPhamPublic(BaseModel):
    """
    Schema sản phẩm rút gọn cho trang danh sách (card sản phẩm).
    """
    id: int
    ma_san_pham: str
    ten_san_pham: str
    slug: str
    gia_goc: Optional[Decimal] = None
    gia_hien_tai: Optional[Decimal] = None
    anh_dai_dien_url: Optional[str] = None
    thuong_hieu: Optional[ThuongHieuResponse] = None
    review_count: int = Field(0)
    average_rating: Optional[float] = None

    class Config:
        orm_mode = True