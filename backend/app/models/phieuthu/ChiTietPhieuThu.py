from ...extensions import db

class ChiTietPhieuThu(db.Model):
    """
    Mô hình ChiTietPhieuThu đại diện cho chi tiết của một phiếu thu trong hệ thống.

    Thuộc tính:
        id (int): Khóa chính, định danh duy nhất cho mỗi chi tiết phiếu thu.
        phieu_thu_id (int): Khóa ngoại tham chiếu đến bảng phieu_thu, cho biết chi tiết này thuộc phiếu thu nào.
        bien_the_san_pham_id (int): Khóa ngoại tham chiếu đến bảng bien_the_san_pham, xác định biến thể sản phẩm liên quan.
        so_luong (int): Số lượng sản phẩm trong chi tiết phiếu thu, mặc định là 1.
        gia_nhap_tung_vat (Decimal): Giá nhập của từng vật phẩm trong chi tiết phiếu thu.

    Quan hệ:
        phieu_thu: Quan hệ nhiều-một với mô hình PhieuThu, sử dụng back_populates 'chi_tiet_phieu_thus'.
        bien_the_san_pham: Quan hệ nhiều-một với mô hình BienTheSanPham.

    Phương thức:
        __repr__(): Trả về chuỗi đại diện cho đối tượng ChiTietPhieuThu.
    """
    __tablename__ = 'chi_tiet_phieu_thu'

    id = db.Column(db.Integer, primary_key=True)
    phieu_thu_id = db.Column(db.Integer, db.ForeignKey('phieu_thu.id'), nullable=True, index=True) 
    bien_the_san_pham_id = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=True, index=True) 
    so_luong = db.Column(db.Integer, nullable=False, server_default="1")
    gia_nhap_tung_vat = db.Column(db.Numeric(12, 0), nullable=False)
    ngay_tao = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    ngay_cap_nhat = db.Column(db.DateTime, nullable=False, server_default=db.func.now(), onupdate=db.func.now())
    phieu_thu = db.relationship("PhieuThu", back_populates='chi_tiet_phieu_thus')
    bien_the_san_pham = db.relationship('BienTheSanPham')

    def __repr__(self):
        return f'<Chi tiết phiếu thu {self.id}>'