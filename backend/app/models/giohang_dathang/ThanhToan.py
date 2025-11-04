# app/models/thanh_toan.py

from datetime import datetime
from ...extensions import db
from ..enums import TrangThaiThanhToanEnum, PhuongThucThanhToanEnum

class ThanhToan(db.Model):
    """
    Lớp ThanhToan đại diện cho bảng 'thanh_toan' trong cơ sở dữ liệu, lưu trữ thông tin thanh toán cho từng đơn hàng.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi bản ghi thanh toán.
        don_hang_id (int): Khóa ngoại liên kết đến đơn hàng, đảm bảo mỗi đơn hàng chỉ có một thanh toán.
        so_tien (Decimal): Số tiền cần thanh toán, không được nhỏ hơn 0.
        phuong_thuc (PhuongThucThanhToanEnum): Phương thức thanh toán (ví dụ: COD, chuyển khoản, v.v.).
        trang_thai (TrangThaiThanhToanEnum): Trạng thái thanh toán (chờ thanh toán, đã thanh toán, v.v.).
        ma_giao_dich_ben_thu_3 (str): Mã giao dịch với bên thứ 3 (nếu có), dùng cho các phương thức thanh toán online.
        ngay_tao (datetime): Thời điểm tạo bản ghi thanh toán.
        ngay_cap_nhat (datetime): Thời điểm cập nhật bản ghi thanh toán gần nhất.

    Quan hệ:
        don_hang (DonHang): Mối quan hệ một-một với đơn hàng, liên kết thông tin thanh toán với đơn hàng tương ứng.

    Ràng buộc:
        - Số tiền thanh toán phải lớn hơn hoặc bằng 0.
        - Mỗi đơn hàng chỉ có một bản ghi thanh toán duy nhất.
        
    Phương thức:
        __repr__: Trả về chuỗi biểu diễn đối tượng, hiển thị ID đơn hàng và trạng thái thanh toán.
    """
    __tablename__ = 'thanh_toan'
    
    id = db.Column(db.Integer, primary_key=True)
    don_hang_id = db.Column(db.Integer, db.ForeignKey('don_hang.id'), nullable=False, unique=True)
    so_tien = db.Column(db.Numeric(14, 2), nullable=False)
    phuong_thuc = db.Column(db.Enum(PhuongThucThanhToanEnum),default= PhuongThucThanhToanEnum.COD, nullable=False)
    trang_thai = db.Column(db.Enum(TrangThaiThanhToanEnum), default=TrangThaiThanhToanEnum.CHO_THANH_TOAN, nullable=False)
    ma_giao_dich_ben_thu_3 = db.Column(db.String(255), nullable=True, index=True)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # --- Mối quan hệ ---
    don_hang = db.relationship('DonHang', back_populates='thanh_toan')

    #--- Ràng buộc ---
    __table_args__ = (
        db.CheckConstraint('so_tien >= 0', name='ck_thanhtoan_so_tien'), 
    )

    def __repr__(self):
        return f'<Thanh toán cho Đơn hàng ID {self.don_hang_id} - {self.trang_thai.value}>'