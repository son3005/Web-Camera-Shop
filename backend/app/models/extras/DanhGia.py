from datetime import datetime
from ...extensions import db
from sqlalchemy import CheckConstraint
from ..enums import TrangThaiDanhGiaEnum
class DanhGia(db.Model):
    __tablename__ = 'danh_gia'

    # -- Các thuộc tính ---
    id = db.Column(db.Integer, primary_key=True)
    chi_tiet_don_hang_id = db.Column(db.Integer, db.ForeignKey('chi_tiet_don_hang.id'), nullable=False, unique=True)
    san_pham_id = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False, index=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, index=True)
    diem_danh_gia = db.Column(db.Integer, nullable=False)
    binh_luan = db.Column(db.Text, nullable=True)
    trang_thai = db.Column(db.Enum(TrangThaiDanhGiaEnum), default=TrangThaiDanhGiaEnum.DA_DUYET, nullable=False)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    #-- Ràng buộc kiểm tra ---
    __table_args__ = (
        CheckConstraint('diem_danh_gia >= 1 AND diem_danh_gia <= 5', name='check_diem_danh_gia_range'),
        db.Index('idx_trang_thai_danhgia', 'trang_thai'),
        db.UniqueConstraint('san_pham_id', 'nguoi_dung_id', name='uq_user_sanpham_danhgia'), 
    )
   

    # --- Các mối quan hệ (Relationships) ---
    nguoi_dung = db.relationship('NguoiDung', back_populates='danh_gias')
    san_pham = db.relationship('SanPham') 
    chi_tiet_don_hang = db.relationship('ChiTietDonHang')

    def __repr__(self):
        return f'<Đánh giá {self.id} cho Sản phẩm ID {self.san_pham_id}>'