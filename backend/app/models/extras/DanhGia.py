from datetime import datetime
from app.extensions import db

class DanhGia(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'danh_gia'

    id = db.Column(db.Integer, primary_key=True)
    
    # Khóa ngoại, liên kết tới bảng 'san_pham'
    ma_san_pham = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False)
    
    # Khóa ngoại, liên kết tới bảng 'nguoi_dung'
    ma_nguoi_dung = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False)
    
    # Điểm đánh giá (ví dụ: từ 1 đến 5 sao)
    diem_danh_gia = db.Column(db.Integer, nullable=False)
    
    # Nội dung bình luận, nhận xét
    binh_luan = db.Column(db.Text, nullable=True)
    
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)

    # --- Các mối quan hệ (Relationships) ---
    
    # Mỗi đánh giá thuộc về một sản phẩm.
    # 'SanPham' là tên class Sản Phẩm.
    # 'cac_danh_gia' là tên thuộc tính trong class SanPham để gọi lại.
    san_pham = db.relationship('SanPham', back_populates='cac_danh_gia')
    
    # Mỗi đánh giá được tạo bởi một người dùng.
    # 'NguoiDung' là tên class Người Dùng.
    # 'cac_danh_gia' là tên thuộc tính trong class NguoiDung để gọi lại.
    nguoi_dung = db.relationship('NguoiDung', back_populates='cac_danh_gia')

    def __repr__(self):
        return f'<Đánh giá của Người dùng ID {self.ma_nguoi_dung} cho Sản phẩm ID {self.ma_san_pham}>'