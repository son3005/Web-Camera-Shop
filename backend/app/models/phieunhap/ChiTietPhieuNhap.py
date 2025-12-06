from ...extensions import db
from datetime import datetime

class ChiTietPhieuNhap(db.Model):
    """
    Mô hình ChiTietPhieuNhap đại diện cho chi tiết của một phiếu nhập trong hệ thống.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi chi tiết phiếu nhập.
        phieu_nhap_id (int): Khóa ngoại tham chiếu đến bảng phieu_nhap, cho biết chi tiết này thuộc phiếu nhập nào.
        bien_the_san_pham_id (int): Khóa ngoại tham chiếu đến bảng bien_the_san_pham, xác định biến thể sản phẩm liên quan.
        so_luong (int): Số lượng sản phẩm trong chi tiết phiếu nhập, mặc định là 1.
        gia_nhap_tung_vat (Decimal): Giá nhập của từng vật phẩm trong chi tiết phiếu nhập.

    Quan hệ:
        phieu_nhap: Quan hệ nhiều-một với mô hình PhieuNhap, sử dụng back_populates 'chi_tiet_phieu_nhaps'.
        bien_the_san_pham: Quan hệ nhiều-một với mô hình BienTheSanPham.

    Phương thức:
        __repr__(): Trả về chuỗi đại diện cho đối tượng ChiTietPhieuNhap.
    """
    __tablename__ = 'chi_tiet_phieu_nhap'

    id = db.Column(db.Integer, primary_key=True)
    phieu_nhap_id = db.Column(db.Integer, db.ForeignKey('phieu_nhap.id'), nullable=True, index=True) 
    bien_the_san_pham_id = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=True, index=True) 
    so_luong = db.Column(db.Integer, nullable=False, server_default="1")
    gia_nhap_tung_vat = db.Column(db.Numeric(12, 0), nullable=False)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    phieu_nhap = db.relationship("PhieuNhap", back_populates='chi_tiet_phieu_nhaps')
    bien_the_san_pham = db.relationship('BienTheSanPham')

    def __repr__(self):
        return f'<Chi tiết phiếu nhập {self.id}>'