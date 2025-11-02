# app/models/don_hang.py

from datetime import datetime
from ...extensions import db
from..enums import TrangThaiDonHangEnum
import uuid

class DonHang(db.Model):
    __tablename__ = 'don_hang'

    # --- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    ma_don_hang = db.Column(db.String(25), unique=True, nullable=False, index=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id', ondelete = "SET NULL"), nullable=True, index=True)
    dia_chi_id = db.Column(db.Integer, db.ForeignKey('dia_chi.id', ondelete = "SET NULL"), nullable=True)
    ten_nguoi_nhan = db.Column(db.String(50), nullable=False)
    so_dien_thoai_nguoi_nhan = db.Column(db.String(15),nullable= False)
    dia_chi_giao = db.Column(db.String(500),nullable= False)
    trang_thai = db.Column(db.Enum(TrangThaiDonHangEnum), default=TrangThaiDonHangEnum.CHO_XAC_NHAN, nullable=False)
    phi_van_chuyen = db.Column(db.Numeric(14, 2), default=0)
    ghi_chu = db.Column(db.Text, nullable=True)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # --- Mối quan hệ ---
    nguoi_dung = db.relationship('NguoiDung', back_populates='don_hangs')
    items = db.relationship('ChiTietDonHang', back_populates='don_hang', cascade="all, delete-orphan")
    thanh_toan = db.relationship('ThanhToan', back_populates='don_hang', uselist=False, cascade="all, delete-orphan")
    dia_chi = db.relationship('DiaChi', back_populates='don_hangs')

    # --- Ràng buộc ---
    __table_args__ = (
        db.CheckConstraint('phi_van_chuyen >= 0', name='ck_phivanchuyen'),
    )

    def __repr__(self):
        return f'<Đơn hàng {self.ma_don_hang}> - Trạng thái: {self.trang_thai.name}'