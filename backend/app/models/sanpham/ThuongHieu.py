from app.extensions import db

class ThuongHieu(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'thuong_hieu'

    id = db.Column(db.Integer, primary_key=True)
    ten = db.Column(db.String(100), unique=True, nullable=False, index=True)
    duong_dan_logo = db.Column(db.String(512), nullable=True)

    # --- Mối quan hệ (Relationship) ---
    
    # Một thương hiệu có nhiều sản phẩm.
    # 'SanPham' là tên class Product đã Việt hóa.
    # 'thuong_hieu' là tên thuộc tính trong class SanPham để gọi lại.
    cac_san_pham = db.relationship('SanPham', back_populates='thuong_hieu', lazy='dynamic')
    
    def __repr__(self):
        return f'<Thương hiệu {self.ten}>'