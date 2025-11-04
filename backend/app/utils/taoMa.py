import uuid
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from ..models.sanpham import SanPham

def generate_ma_don_hang(length=14) :
    """"
        Quy trình hoạt động chi tiết:
        1. Đặt tiền tố (prefix) là "DH" để nhận diện mã đơn hàng.
        2. Lấy ngày hiện tại theo định dạng năm-tháng-ngày (yyMMdd) bằng thời gian UTC, giúp mã đơn hàng chứa thông tin về ngày tạo.
        3. Sinh một chuỗi ngẫu nhiên dựa trên UUID4 và chuyển thành chữ hoa để đảm bảo tính duy nhất cho mỗi mã đơn hàng.
        4. Kết hợp các phần: tiền tố, ngày, chuỗi ngẫu nhiên thành một chuỗi mã đơn hàng hoàn chỉnh.
        5. Cắt chuỗi kết quả theo độ dài yêu cầu (mặc định là 14 ký tự) và trả về.
    """
    prefix = "DH"
    date_part = datetime.utcnow().strftime("%y%m%d%H%M%S")
    random_part = uuid.uuid4().hex.upper()
    code = f"{prefix}{date_part}{random_part}"
    return code[:length]

def generate_ma_nguoi_dung(length=14):
    """
    Hàm generate_ma_nguoi_dung dùng để tạo mã người dùng ngẫu nhiên với độ dài xác định.

    Quy trình hoạt động:
    1. Đặt tiền tố (prefix) là "ND" để nhận diện mã người dùng.
    2. Lấy ngày hiện tại theo định dạng năm-tháng-ngày (yyMMdd) bằng thời gian UTC.
    3. Sinh một chuỗi ngẫu nhiên bằng cách sử dụng uuid4 và chuyển thành chữ hoa.
    4. Kết hợp tiền tố, phần ngày và chuỗi ngẫu nhiên thành một mã duy nhất.
    5. Cắt chuỗi kết quả theo độ dài yêu cầu (mặc định là 14 ký tự) và trả về.

    Tham số:
        length (int): Độ dài tối đa của mã người dùng trả về (mặc định là 14).

    Trả về:
        str: Mã người dùng ngẫu nhiên với độ dài xác định.
    """
    
    prefix = "ND"
    date_part = datetime.utcnow().strftime("%y%m%d%H%M%S")
    random_part = uuid.uuid4().hex.upper()
    code = f"{prefix}{date_part}{random_part}"
    return code[:length]

def generate_ma_san_pham(category_prefix: str, brand_prefix: str, length=24):
    """
    Hàm generate_ma_san_pham dùng để tạo mã sản phẩm duy nhất dựa trên tiền tố loại sản phẩm, tiền tố thương hiệu, ngày hiện tại và một chuỗi ngẫu nhiên.
    
    Các bước hoạt động:
    1. Đặt tiền tố mặc định là "SP" cho mã sản phẩm.
    2. Nhận vào hai tham số tiền tố: category_prefix (tiền tố loại sản phẩm) và brand_prefix (tiền tố thương hiệu).
    3. Lấy ngày hiện tại theo định dạng năm-tháng-ngày (yyMMdd) để đảm bảo mã có thông tin thời gian tạo.
    4. Sinh một chuỗi ngẫu nhiên gồm 8 ký tự in hoa từ UUID để đảm bảo tính duy nhất.
    5. Kết hợp các thành phần trên thành một chuỗi mã sản phẩm theo cấu trúc: "SP" + category_prefix + brand_prefix + date_part + random_part.
    6. Trả về mã sản phẩm với độ dài tối đa do tham số length quy định (mặc định là 24 ký tự).

    Tham số:
        category_prefix (str): Tiền tố đại diện cho loại sản phẩm.
        brand_prefix (str): Tiền tố đại diện cho thương hiệu sản phẩm.
        length (int, optional): Độ dài tối đa của mã sản phẩm. Mặc định là 24.

    Trả về:
        str: Mã sản phẩm duy nhất đã được tạo.
    """
    
    prefix = "SP"
    date_part = datetime.utcnow().strftime("%y%m%d")
    random_part = uuid.uuid4().hex[:8].upper()
    code = f"{prefix}{category_prefix}{brand_prefix}{date_part}{random_part}"
    return code[:length]

def generate_ma_phieu_thu(length=12):
    """
    Hàm generate_ma_phieu_thu dùng để tạo mã phiếu thu tự động.
    
    Tham số:
        length (int, mặc định=12): Độ dài tối đa của mã phiếu thu được sinh ra.
    Hoạt động:
        - Tạo tiền tố "PT" cho mã phiếu thu.
        - Lấy thời gian hiện tại theo định dạng năm-tháng-ngày-giờ-phút-giây (yyMMddHHmmss) bằng UTC.
        - Sinh một chuỗi ngẫu nhiên gồm 8 ký tự từ UUID4 (chuyển thành chữ hoa).
        - Kết hợp các thành phần trên thành một chuỗi mã phiếu thu.
        - Trả về chuỗi mã phiếu thu với độ dài tối đa theo tham số truyền vào.
    Giá trị trả về:
        str: Mã phiếu thu được sinh ra, có độ dài tối đa là 'length'.
    """
    prefix = "PT"
    date_part = datetime.utcnow().strftime("%y%m%d%H%M%S")
    random_part = uuid.uuid4().hex[:8].upper()
    code = f"{prefix}{date_part}{random_part}"
    return code[:length]
