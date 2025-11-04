from ...extensions import db

class ChiTietPhieuThu(db.Model):
    __tablename__ = 'phieu_thu_chi_tiet'

    id = db.Column(db.Integer, primary_key=True)
    phieu_thu_id = db.Column(db.Integer, db.ForeignKey('phieu_thu.id'), nullable=True, index=True) 
    bien_the_san_pham_id = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=True, index=True) 
    so_luong = db.Column(db.Integer, nullable=False, server_default="1")
    gia_nhap_tung_vat = db.Column(db.Numeric(12, 2), nullable=False)

    # Sửa: Đảm bảo tên relationship khớp với PhieuThu
    phieu_thu = db.relationship("PhieuThu", back_populates='chi_tiet_phieu_thus')
    bien_the_san_pham = db.relationship('BienTheSanPham')

    def __repr__(self):
        return f'<Chi tiết phiếu thu {self.id}>'  # Sửa cho đúng