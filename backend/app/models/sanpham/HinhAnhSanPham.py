from app.extensions import db

class HinhAnhSanPham(db.Model):
    __tablename__ = 'hinh_anh_san_pham'

    id = db.Column(db.Integer, primary_key=True)
    bien_the_id = db.Column(db.Integer, db.ForeignKey('bien_the_san_pham.id'), nullable=False, index=True)
    url = db.Column(db.String(512), nullable=False)
    public_id = db.Column(db.String(255), nullable=False, index=True) 
    alt_text = db.Column(db.String(200), nullable=True) 
    la_anh_dai_dien = db.Column(db.Boolean, default=False)
    bien_the = db.relationship('BienTheSanPham', back_populates='hinh_anhs')
    
    def __repr__(self):
        return f'<Hình ảnh {self.id} - public_id: {self.public_id}>'