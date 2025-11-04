from sqlalchemy import event
from ...extensions import db

class CapDo(db.Model):
    __tablename__ = 'cap_do'

    id = db.Column(db.Integer, primary_key=True)
    ma_cap_do = db.Column(db.String(5), unique=True, nullable=False, index=True)
    ten_cap_do = db.Column(db.String(100), unique=True, nullable=False)

    san_phams = db.relationship('SanPham', back_populates='cap_do', lazy='dynamic') 