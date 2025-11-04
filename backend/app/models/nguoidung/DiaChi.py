# app/models/dia_chi.py

from datetime import datetime
from ...extensions import db
from sqlalchemy import Index

class DiaChi(db.Model):
    """
    Lớp DiaChi đại diện cho bảng 'dia_chi' trong cơ sở dữ liệu, lưu trữ thông tin địa chỉ giao hàng của người dùng.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi địa chỉ.
        nguoi_dung_id (int): Khóa ngoại liên kết đến người dùng sở hữu địa chỉ này.
        ten_nguoi_nhan (str): Tên người nhận hàng tại địa chỉ này.
        so_dien_thoai (str): Số điện thoại liên hệ của người nhận.
        phuong_xa (str): Phường/xã của địa chỉ.
        tinh_thanh (str): Tỉnh/thành phố của địa chỉ.
        dia_chi_cu_the (str): Địa chỉ cụ thể (số nhà, tên đường, v.v.).
        ma_buu_dien (str, tùy chọn): Mã bưu điện của địa chỉ.
        la_mac_dinh (bool): Đánh dấu đây có phải là địa chỉ mặc định của người dùng hay không.
        ngay_tao (datetime): Thời điểm tạo địa chỉ.
        ngay_cap_nhat (datetime): Thời điểm cập nhật địa chỉ gần nhất.

    Quan hệ:
        nguoi_dung: Tham chiếu đến đối tượng Người Dùng sở hữu địa chỉ này.
        don_hangs: Danh sách các đơn hàng liên quan đến địa chỉ này.
        
    Chỉ mục:
        idx_diachi_macdinh: Chỉ mục kết hợp trên 'nguoi_dung_id' và 'la_mac_dinh' để tối ưu truy vấn địa chỉ mặc định của người dùng.
        
    Phương thức:
        __repr__: Trả về chuỗi biểu diễn đối tượng địa chỉ, hiển thị ID địa chỉ và ID người dùng sở hữu.
    """
   

    __tablename__ = 'dia_chi'

    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, index=True)
    ten_nguoi_nhan = db.Column(db.String(100), nullable=False)
    so_dien_thoai = db.Column(db.String(15), nullable=False)
    phuong_xa = db.Column(db.String(100), nullable=False)
    tinh_thanh = db.Column(db.String(100), nullable=False)
    dia_chi_cu_the = db.Column(db.String(255), nullable=False)
    ma_buu_dien = db.Column(db.String(20), nullable=True)
    la_mac_dinh = db.Column(db.Boolean, default=False, nullable=False)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # --- Mối quan hệ (Relationship) ---
    nguoi_dung = db.relationship('NguoiDung', back_populates='dia_chis')
    don_hangs = db.relationship("DonHang", back_populates = "dia_chi")

    __table_args__ = (
        db.Index('idx_diachi_macdinh', 'nguoi_dung_id', 'la_mac_dinh'),
    )
    
    def __repr__(self):
        return f'<Địa chỉ {self.id} của Người dùng ID {self.nguoi_dung_id}>'