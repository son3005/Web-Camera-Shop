from ...extensions import db
from datetime import datetime

class PhieuThu(db.Model):
    """
    Lớp PhieuThu đại diện cho bảng 'phieu_thu' trong cơ sở dữ liệu.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi phiếu thu.
        nguoi_nhap_id (int): Khóa ngoại liên kết đến người dùng nhập phiếu thu, có thể để trống.
        ma_phieu_thu (str): Mã định danh cho phiếu thu, tối đa 25 ký tự.
        ten_nha_cung_cap (str): Tên nhà cung cấp, không được để trống, tối đa 100 ký tự.
        ngay_thu (datetime): Ngày lập phiếu thu, mặc định là thời điểm hiện tại.
        chi_tiet_phieu_thus (list[ChiTietPhieuThu]): Danh sách các chi tiết phiếu thu liên quan.
        nguoi_dung (NguoiDung): Đối tượng người dùng nhập phiếu thu.
        
    Phương thức:
        __repr__(): Trả về chuỗi biểu diễn đối tượng phiếu thu với mã phiếu thu.
    """
    __tablename__ = 'phieu_thu'

    id = db.Column(db.Integer, primary_key=True)
    nguoi_nhap_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=True, index=True)
    ma_phieu_thu = db.Column(db.String(25), index=True)
    ten_nha_cung_cap = db.Column(db.String(100), nullable=False)
    ngay_thu = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    ngay_cap_nhat = db.Column(db.DateTime, nullable=False, server_default=db.func.now(), onupdate=db.func.now())
    chi_tiet_phieu_thus = db.relationship('ChiTietPhieuThu', back_populates='phieu_thu', cascade="all, delete-orphan")
    nguoi_dung = db.relationship('NguoiDung', back_populates='phieu_thus')

    def __repr__(self):
        return f'<Phiếu thu {self.ma_phieu_thu}>'