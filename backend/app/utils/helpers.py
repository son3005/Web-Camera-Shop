# app/utils/helpers.py

from sqlalchemy import func
from app.extensions import db
from app.models.sanpham import SanPham
import unicodedata
import re

def generate_unique_slug(base_text: str, product_id: int = None) -> str:
    """
    Tạo slug duy nhất từ tên sản phẩm.
    Nếu slug đã tồn tại → thêm hậu tố -1, -2, ...
    """
    # Bước 1: Tạo slug cơ bản
    slug = unicodedata.normalize('NFKD', base_text)
    slug = re.sub(r'[^\w\s-]', '', slug).strip().lower()
    slug = re.sub(r'[-\s]+', '-', slug)
    
    if not slug:
        slug = "san-pham"

    original_slug = slug
    counter = 1

    # Bước 2: Kiểm tra trùng trong DB
    while True:
        query = db.session.query(SanPham).filter(SanPham.slug == slug)
        if product_id:
            query = query.filter(SanPham.id != product_id)
        
        exists = db.session.query(query.exists()).scalar()
        
        if not exists:
            return slug
        
        # Nếu trùng → thêm số
        slug = f"{original_slug}-{counter}"
        counter += 1