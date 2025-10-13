# app/models/dia_chi.py

from datetime import datetime
from app.extensions import db

class DiaChi(db.Model):
    # CẢI TIẾN: Tên bảng ngắn gọn, nhất quán
    __tablename__ = 'DIACHI'


    id = db.Column(db.String(14), primary_key=True)
    
    # CẢI TIẾN 1: Khóa ngoại phải khớp kiểu dữ liệu với khóa chính (Integer).
    # Đổi tên cột cho nhất quán với model NguoiDung.
    maNguoiDung = db.Column(db.Integer, db.ForeignKey('NGUOIDUNG.maNguoiDung'), nullable=False, index=True)
    
    # CẢI TIẾN 2: Đổi tên các cột sang dạng camelCase cho nhất quán toàn bộ dự án.
    tenNguoiNhan = db.Column(db.String(50), nullable=False)
    soDienThoai = db.Column(db.String(15), nullable=False) # Tăng độ dài để linh hoạt hơn
    
    # CẢI TIẾN 3: Chia nhỏ địa chỉ để dễ dàng xử lý và truy vấn hơn.
    diaChiCuThe = db.Column(db.String(255), nullable=False) # Ví dụ: Số 123, đường ABC
    phuongXa = db.Column(db.String(100), nullable=False)
    tinhThanh = db.Column(db.String(100), nullable=False)
    maBuuDien = db.Column(db.String(20), nullable=True)
    laMacDinh = db.Column(db.Boolean, default=False, nullable=False)
    
    # CẢI TIẾN 4: Thêm dấu thời gian để theo dõi việc tạo và cập nhật.
    ngayTao = db.Column(db.DateTime, default=datetime.utcnow)
    ngayCapNhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # --- Mối quan hệ (Relationship) ---
    
    nguoiDung = db.relationship('NguoiDung', back_populates='cacDiaChi')
    
    def __repr__(self):
        return f'<Địa chỉ {self.id} của Người dùng ID {self.maNguoiDung}>'