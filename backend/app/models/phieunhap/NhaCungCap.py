from datetime import datetime
from ...extensions import db
from ..enums import TrangThaiNhaCungCapEnum
 
class NhaCungCap(db.Model):
    """
    Lớp NhaCungCap đại diện cho bảng 'nha_cung_cap' trong cơ sở dữ liệu
    """
    __tablename__ = 'nha_cung_cap'

    id = db.Column(db.Integer, primary_key=True)
    ma_nha_cung_cap = db.Column(db.String(12), unique=True, nullable=False, index=True)
    ten_nha_cung_cap = db.Column(db.String(100), nullable=False)
    dia_chi = db.Column(db.String(500), nullable=True)
    so_dien_thoai = db.Column(db.String(15), nullable=True)
    email = db.Column(db.String(100), nullable=True)
    nguoi_dai_dien = db.Column(db.String(100), nullable=True)
    tai_khoan_ngan_hang = db.Column(db.String(50), nullable=True)
    ten_ngan_hang = db.Column(db.String(100), nullable=True)
    trang_thai = db.Column(db.Enum(TrangThaiNhaCungCapEnum), default=TrangThaiNhaCungCapEnum.KICH_HOAT, nullable=False)
    ghi_chu = db.Column(db.Text, nullable=True)
    ngay_tao = db.Column(db.DateTime, default=datetime.utcnow)
    ngay_cap_nhat = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Quan hệ
    phieu_nhaps = db.relationship('PhieuNhap', back_populates='nha_cung_cap', lazy='noload', passive_deletes=True)

    # Ràng buộc và chỉ mục có thể được thêm vào ở đây nếu cần thiết
    __table_args__ = (
    db.Index(
        'idx_nhacungcap_fts',
        'ten_nha_cung_cap',
        'ma_nha_cung_cap',
        'nguoi_dai_dien',
        'email',
        'dia_chi',
        'so_dien_thoai',

        mysql_prefix='FULLTEXT',
        mysql_with_parser='ngram'
    ),
    db.Index('idx_ten_nha_cung_cap_like', 'ten_nha_cung_cap')
    )


    def __repr__(self):
        return f'<Nhà cung cấp {self.ten_nha_cung_cap}>'