from sqlalchemy import event
from app.extensions import db
from app.utils.slug import generate_slug # Giả sử bạn có một hàm tạo slug

class ThuongHieu(db.Model):
    __tablename__ = 'thuong_hieu'

    id = db.Column(db.Integer, primary_key=True)
    ma_thuong_hieu = db.Column(db.String(20), unique=True, nullable=False, index=True)
    ten_thuong_hieu = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(150), unique=True, nullable=False, index=True)
    logo_url = db.Column(db.String(512), nullable=True)

    # --- Mối quan hệ ---
    san_phams = db.relationship('SanPham', back_populates='thuong_hieu', lazy='dynamic')
    
    def __repr__(self):
        return f'<Thương hiệu {self.ten_thuong_hieu}>'

# TỰ ĐỘNG TẠO SLUG
@event.listens_for(ThuongHieu, 'before_insert')
def before_insert_listener(mapper, connection, target):
    if target.ten_thuong_hieu and not target.slug:
        target.slug = generate_slug(target.ten_thuong_hieu, ThuongHieu)

@event.listens_for(ThuongHieu, 'before_update')
def before_update_listener(mapper, connection, target):
    if target.ten_thuong_hieu and not target.slug:
        target.slug = generate_slug(target.ten_thuong_hieu, ThuongHieu)
