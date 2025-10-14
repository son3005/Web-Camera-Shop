# app/models/dia_chi.py

from datetime import datetime
from app.extensions import db

class DiaChi(db.Model):
    # CẢI TIẾN: Tên bảng snake_case
    __tablename__ = 'dia_chi'

    id = db.Column(db.Integer, primary_key=True)
    
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, index=True)
    ten_nguoi_nhan = db.Column(db.String(100), nullable=False)
    so_dien_thoai = db.Column(db.String(15), nullable=False)
    
    # Chia nhỏ địa chỉ là một thực hành rất tốt
    dia_chi_cu_the = db.Column(db.String(255), nullable=False) # Ví dụ: Số 123, đường ABC
    phuong_xa = db.Column(db.String(100), nullable=False)
    tinh_thanh = db.Column(db.String(100), nullable=False)
    ma_buu_dien = db.Column(db.String(20), nullable=True)
    
    la_mac_dinh = db.Column(db.Boolean, default=False, nullable=False)
    
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # --- Mối quan hệ (Relationship) ---
    # Đổi tên thuộc tính `nguoiDung` thành `nguoi_dung`
    nguoi_dung = db.relationship('NguoiDung', back_populates='dia_chis')
    
    def __repr__(self):
        return f'<Địa chỉ {self.id} của Người dùng ID {self.nguoi_dung_id}>'