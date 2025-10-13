from app.extensions import db

class DiaChi(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'dia_chi'

    id = db.Column(db.Integer, primary_key=True)
    
    # Khóa ngoại, liên kết tới bảng 'nguoi_dung'
    ma_nguoi_dung = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False)
    
    ten_nguoi_nhan = db.Column(db.String(100), nullable=False)
    so_dien_thoai = db.Column(db.String(20), nullable=False)
    dia_chi_cu_the = db.Column(db.String(255), nullable=False) # Ví dụ: Số nhà, tên đường, phường/xã
    tinh = db.Column(db.String(100), nullable=False) # Tỉnh/Thành phố
    phuong = db.Column(db.String(100), nullable=False) # Quận/Huyện/Thị xã
    quoc_gia = db.Column(db.String(100), nullable=False)
    ma_buu_dien = db.Column(db.String(20), nullable=True)
    
    # Đánh dấu đây có phải là địa chỉ mặc định hay không
    la_mac_dinh = db.Column(db.Boolean, default=False, nullable=False)
    
    # --- Mối quan hệ (Relationship) ---
    
    # Mỗi địa chỉ thuộc về một người dùng.
    # 'NguoiDung' là tên class User đã Việt hóa.
    # 'cac_dia_chi' là tên thuộc tính trong class NguoiDung để gọi lại.
    nguoi_dung = db.relationship('NguoiDung', back_populates='cac_dia_chi')
    
    def __repr__(self):
        return f'<Địa chỉ {self.id} cho Người dùng ID {self.ma_nguoi_dung}>'