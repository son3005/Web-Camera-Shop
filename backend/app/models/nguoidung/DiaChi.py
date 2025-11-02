# app/models/dia_chi.py

from datetime import datetime
from ...extensions import db
from sqlalchemy import Index

class DiaChi(db.Model):
    """
    DiaChi là một lớp đại diện cho bảng 'dia_chi' trong cơ sở dữ liệu, lưu trữ thông tin về địa chỉ của người dùng.
    Attributes:
        id (int): ID duy nhất của địa chỉ.
        nguoi_dung_id (int): ID của người dùng liên kết với địa chỉ này.
        ten_nguoi_nhan (str): Tên người nhận tại địa chỉ.
        so_dien_thoai (str): Số điện thoại liên lạc tại địa chỉ.
        phuong_xa (str): Phường/xã nơi địa chỉ nằm.
        tinh_thanh (str): Tỉnh/thành phố nơi địa chỉ nằm.
        dia_chi_cu_the (str): Địa chỉ cụ thể (chi tiết).
        ma_buu_dien (str, optional): Mã bưu điện của địa chỉ.
        la_mac_dinh (bool): Đánh dấu địa chỉ có phải là địa chỉ mặc định hay không.
        ngay_tao (datetime): Thời gian tạo địa chỉ.
        ngay_cap_nhat (datetime): Thời gian cập nhật địa chỉ gần nhất.
    Relationships:
        nguoi_dung (NguoiDung): Mối quan hệ với lớp NguoiDung, đại diện cho người dùng sở hữu địa chỉ này.
        don_hangs (list[DonHang]): Danh sách các đơn hàng liên kết với địa chỉ này.
    Methods:
        __repr__: Trả về chuỗi biểu diễn của đối tượng DiaChi, bao gồm ID và ID người dùng liên kết.
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