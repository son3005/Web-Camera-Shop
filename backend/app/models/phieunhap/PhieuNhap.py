from ...extensions import db
from datetime import datetime

class PhieuNhap(db.Model):
    """
    Lớp PhieuNhap đại diện cho bảng 'phieu_nhap' trong cơ sở dữ liệu.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi phiếu nhập.
        nguoi_nhap_id (int): Khóa ngoại liên kết đến người dùng nhập phiếu nhập, có thể để trống.
        ma_phieu_nhap (str): Mã định danh cho phiếu nhập, tối đa 25 ký tự.
        id_nha_cung_cap (int): Khóa ngoại liên kết đến nhà cung cấp, không được để trống.
        ngay_nhap (datetime): Ngày lập phiếu nhập, mặc định là thời điểm hiện tại.
        chi_tiet_phieu_nhaps (list[ChiTietPhieuNhap]): Danh sách các chi tiết phiếu nhập liên quan.
        nguoi_dung (NguoiDung): Đối tượng người dùng nhập phiếu nhập.
        
    Phương thức:
        __repr__(): Trả về chuỗi biểu diễn đối tượng phiếu nhập với mã phiếu nhập.
    """
    __tablename__ = 'phieu_nhap'

    id = db.Column(db.Integer, primary_key=True)
    nguoi_nhap_id = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=True, index=True)
    ma_phieu_nhap = db.Column(db.String(25), index=True)
    nha_cung_cap_id = db.Column(db.Integer, db.ForeignKey('nha_cung_cap.id'), nullable=False)
    ngay_nhap = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    chi_tiet_phieu_nhaps = db.relationship('ChiTietPhieuNhap', back_populates='phieu_nhap', cascade="all, delete-orphan")
    nha_cung_cap = db.relationship('NhaCungCap', back_populates='phieu_nhaps')
    nguoi_dung = db.relationship('NguoiDung', back_populates='phieu_nhaps')

    def __repr__(self):
        return f'<Phiếu nhập {self.ma_phieu_nhap}>'