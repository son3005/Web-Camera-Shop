from datetime import datetime
from app.extensions import db
from sqlalchemy import CheckConstraint
import enum


class TrangThaiDanhGia(enum.Enum):
    DA_DUYET = "da_duyet"
    BI_TU_CHOI = "bi_tu_choi"

class DanhGia(db.Model):
    __tablename__ = 'danh_gia'

    id = db.Column(db.Integer, primary_key=True)
    chi_tiet_don_hang_id = db.Column(db.Integer, db.ForeignKey('chi_tiet_don_hang.id'), nullable=False, unique=True)
    san_pham_id = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False, index=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, index=True)
    
    #Thêm ràng buộc điểm từ 1 đến 5
    diem_danh_gia = db.Column(db.Integer, nullable=False)
    __table_args__ = (
        CheckConstraint('diem_danh_gia >= 1 AND diem_danh_gia <= 5', name='check_diem_danh_gia_range'),
    )
    binh_luan = db.Column(db.Text, nullable=True)
    
    # Thêm trạng thái để admin có thể duyệt/ẩn đánh giá
    trang_thai = db.Column(db.Enum(TrangThaiDanhGia), default=TrangThaiDanhGia.DA_DUYET, nullable=False)

    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Các mối quan hệ (Relationships) ---
    
    # Một đánh giá được viết bởi một người dùng
    nguoi_dung = db.relationship('NguoiDung', back_populates='danh_gias')
    
    # Một đánh giá là dành cho một sản phẩm. 
    san_pham = db.relationship('SanPham') 

    # Mối quan hệ một-một với ChiTietDonHang
    chi_tiet_don_hang = db.relationship('ChiTietDonHang')

    def __repr__(self):
        return f'<Đánh giá {self.id} cho Sản phẩm ID {self.san_pham_id}>'