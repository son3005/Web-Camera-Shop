from datetime import datetime
from sqlalchemy import event, select, func
from app.extensions import db
from app.utils.slug import generate_slug # Giả sử bạn có một hàm tạo slug
from app.models.sanpham.DanhMuc import DanhMuc
from app.models.sanpham.ThuongHieu import ThuongHieu
import enum

class TrangThaiSanPham(enum.Enum):
    DANG_BAN = 'đang bán'
    AN = 'ẩn'
    HET_HANG = 'hết hàng'

class SanPham(db.Model):
    __tablename__ = 'san_pham' # ĐỀ XUẤT: Dùng snake_case cho tên bảng

 # THAY ĐỔI: Khóa chính là String, độ dài đủ lớn
    id = db.Column(db.Integer, primary_key=True)
    # Thêm cột mã sản phẩm để người dùng xem, duy nhất và không thay đổi
    ma_san_pham = db.Column(db.String(50), unique=True, nullable=False, index=True)
    # THAY ĐỔI QUAN TRỌNG: Kiểu dữ liệu của khóa ngoại
    # phải khớp với kiểu dữ liệu của khóa chính mà nó trỏ tới.
    danh_muc_id = db.Column(db.Integer, db.ForeignKey('danh_muc.id'), nullable=False, index=True)
    thuong_hieu_id = db.Column(db.Integer, db.ForeignKey('thuong_hieu.id'), nullable=False, index=True)
    
    ten_san_pham = db.Column(db.String(200), nullable=False, index=True)
    slug = db.Column(db.String(255), unique=True, nullable=False, index=True)
    mo_ta = db.Column(db.Text, nullable=True)
    
    # Dùng JSON cho thông số kỹ thuật là một lựa chọn rất tốt!
    thong_so_ky_thuat = db.Column(db.JSON, nullable=True)
    
    trang_thai = db.Column(db.Enum(TrangThaiSanPham), nullable=False, default=TrangThaiSanPham.DANG_BAN)

    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Mối quan hệ ---
    # Đổi tên thuộc tính relationship cho nhất quán
    danh_muc = db.relationship('DanhMuc', back_populates='san_phams')
    thuong_hieu = db.relationship('ThuongHieu', back_populates='san_phams')

    # `cac_bien_the` vẫn là một tên tốt
    cac_bien_the = db.relationship('BienTheSanPham', back_populates='san_pham_goc', cascade="all, delete-orphan")
    
    # Giữ lại lazy='dynamic' nếu bạn cần query thêm trên các đánh giá
    # cac_danh_gia = db.relationship('DanhGia', back_populates='san_pham', lazy='dynamic')
    
    def __repr__(self):
        return f'<Sản phẩm {self.ten_san_pham}>'

# Event listener bây giờ sẽ tạo `ma_san_pham` thay vì `id`
@event.listens_for(SanPham, 'before_insert')
def before_san_pham_insert(mapper, connection, target):
    # Tạo slug (giữ nguyên)
    if target.ten_san_pham and not target.slug:
        target.slug = generate_slug(target.ten_san_pham, SanPham)

    # Tự động tạo mã sản phẩm nếu chưa có
    if not target.ma_san_pham:
        # Lấy mã từ các bảng cha
        danh_muc = db.session.get(DanhMuc, target.danh_muc_id)
        thuong_hieu = db.session.get(ThuongHieu, target.thuong_hieu_id)

        if not danh_muc or not thuong_hieu:
             raise ValueError("DanhMuc hoặc ThuongHieu ID không hợp lệ.")

        prefix = f"{danh_muc.ma_danh_muc}-{thuong_hieu.ma_thuong_hieu}-"
        
        # Tìm số thứ tự lớn nhất của prefix này
        max_ma = connection.execute(
            select(func.max(SanPham.ma_san_pham)).where(SanPham.ma_san_pham.like(f"{prefix}%"))
        ).scalar_one_or_none()

        next_seq = 1
        if max_ma:
            try:
                last_seq = int(max_ma.split('-')[-1])
                next_seq = last_seq + 1
            except (ValueError, IndexError):
                pass
        
        target.ma_san_pham = f"{prefix}{next_seq:05d}"