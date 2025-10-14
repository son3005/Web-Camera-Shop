# app/models/don_hang.py

from datetime import datetime
from app.extensions import db
import enum

class TrangThaiDonHang(enum.Enum):
    # Dùng giá trị snake_case cho Enum để nhất quán
    CHO_XAC_NHAN = "cho_xac_nhan"
    DA_XAC_NHAN = "da_xac_nhan"
    DANG_GIAO_HANG = "dang_giao_hang"
    HOAN_THANH = "hoan_thanh"
    DA_HUY = "da_huy"
    YEU_CAU_TRA_HANG = "yeu_cau_tra_hang"
    DA_TRA_HANG = "da_tra_hang"

class DonHang(db.Model):
    __tablename__ = 'don_hang'

    id = db.Column(db.Integer, primary_key=True)
    # Mã đơn hàng để người dùng và admin dễ tra cứu
    ma_don_hang = db.Column(db.String(50), unique=True, nullable=False, index=True)
    
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, index=True)
    
    trang_thai = db.Column(db.Enum(TrangThaiDonHang), default=TrangThaiDonHang.CHO_XAC_NHAN, nullable=False)
    
    # Dùng Numeric cho tất cả các giá trị tiền tệ
    tam_tinh = db.Column(db.Numeric(12, 2), nullable=False)
    phi_van_chuyen = db.Column(db.Numeric(12, 2), default=0)
    giam_gia = db.Column(db.Numeric(12, 2), default=0)
    tong_tien = db.Column(db.Numeric(12, 2), nullable=False)
    
    # "Đóng băng" thông tin giao hàng tại thời điểm đặt
    ten_nguoi_nhan = db.Column(db.String(100))
    so_dien_thoai_nhan = db.Column(db.String(15))
    dia_chi_giao_hang = db.Column(db.String(500)) # Lưu địa chỉ đầy đủ dưới dạng text
    ghi_chu = db.Column(db.Text, nullable=True)

    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # --- Mối quan hệ ---
    nguoi_dung = db.relationship('NguoiDung', back_populates='don_hangs')
    items = db.relationship('ChiTietDonHang', back_populates='don_hang', cascade="all, delete-orphan")
    thanh_toan = db.relationship('ThanhToan', back_populates='don_hang', uselist=False, cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Đơn hàng {self.ma_don_hang}>'