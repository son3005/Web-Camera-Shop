# app/models/danh_gia.py

from datetime import datetime
from app.extensions import db
from sqlalchemy import CheckConstraint
import enum

# CẢI TIẾN: Thêm trạng thái để kiểm duyệt đánh giá
class TrangThaiDanhGia(enum.Enum):
    DA_DUYET = "da_duyet"
    BI_TU_CHOI = "bi_tu_choi"

class DanhGia(db.Model):
    # Chuẩn hóa tên bảng
    __tablename__ = 'danh_gia'

    id = db.Column(db.Integer, primary_key=True)
    
    # --- CÁC CẢI TIẾN LỚN ---

    # 1. Liên kết tới ChiTietDonHang để xác thực việc mua hàng
    # Một mục trong đơn hàng chỉ được đánh giá một lần (unique=True)
    chi_tiet_don_hang_id = db.Column(db.Integer, db.ForeignKey('chi_tiet_don_hang.id'), nullable=False, unique=True)
    
    # 2. Vẫn giữ lại các liên kết trực tiếp để truy vấn nhanh hơn
    san_pham_id = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False, index=True)
    nguoi_dung_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, index=True)
    
    # 3. Thêm ràng buộc CheckConstraint để đảm bảo điểm từ 1 đến 5
    diem_danh_gia = db.Column(db.Integer, nullable=False)
    __table_args__ = (
        CheckConstraint('diem_danh_gia >= 1 AND diem_danh_gia <= 5', name='check_diem_danh_gia_range'),
    )

    # --- CÁC CẢI TIẾN KHÁC ---

    # Thêm tiêu đề cho đánh giá
    tieu_de = db.Column(db.String(255), nullable=True)
    binh_luan = db.Column(db.Text, nullable=True)
    
    # Thêm trạng thái để admin có thể duyệt/ẩn đánh giá
    trang_thai = db.Column(db.Enum(TrangThaiDanhGia), default=TrangThaiDanhGia.DA_DUYET, nullable=False)

    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Các mối quan hệ (Relationships) ---
    
    # Một đánh giá được viết bởi một người dùng
    nguoi_dung = db.relationship('NguoiDung', back_populates='danh_gias')
    
    # Một đánh giá là dành cho một sản phẩm. 
    # Thêm một relationship ở model SanPham:
    # danh_gias = db.relationship('DanhGia', back_populates='san_pham', lazy='dynamic')
    san_pham = db.relationship('SanPham') 

    # Mối quan hệ một-một với ChiTietDonHang
    # Thêm một relationship ở model ChiTietDonHang:
    # danh_gia = db.relationship('DanhGia', back_populates='chi_tiet_don_hang', uselist=False)
    chi_tiet_don_hang = db.relationship('ChiTietDonHang')

    def __repr__(self):
        return f'<Đánh giá {self.id} cho Sản phẩm ID {self.san_pham_id}>'