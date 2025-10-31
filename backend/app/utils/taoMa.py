import uuid
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from ..models.sanpham import SanPham

def generate_ma_don_hang(length=25) :
    """Tạo mã đơn hàng duy nhất."""
    prefix = "DH"
    date_part = datetime.utcnow().strftime("%y%m%d")
    random_part = uuid.uuid4().hex.upper()
    code = f"{prefix}{date_part}{random_part}"
    return code[:length]

def generate_ma_nguoi_dung(length=20):
    """Tạo mã người dùng"""
    prefix = "ND"
    date_part = datetime.utcnow().strftime("%y%m%d")
    random_part = uuid.uuid4().hex.upper()
    code = f"{prefix}{date_part}{random_part}"
    return code[:length]

def generate_ma_san_pham(category_prefix: str, brand_prefix: str, length=24):
    """
    Tạo mã sản phẩm dựa trên loại và thương hiệu.
    Ví dụ: SP{2}CCCCC{5}BBBBB{5}DDDDDD{6}XXXXXXXX{8}
    """
    prefix = "SP"
    date_part = datetime.utcnow().strftime("%y%m%d")
    random_part = uuid.uuid4().hex[:8].upper()
    code = f"{prefix}{category_prefix}{brand_prefix}{date_part}{random_part}"
    return code[:length]

def generate_unique_ma_san_pham(category_prefix: str, brand_prefix: str, length=24):
    max_retries = 5
    for _ in range(max_retries):
        code = generate_ma_san_pham(category_prefix, brand_prefix, length)
        if not SanPham.query.filter_by(ma_san_pham=code).first():
            return code
    raise Exception("Không thể tạo mã sản phẩm duy nhất sau 5 lần thử")
