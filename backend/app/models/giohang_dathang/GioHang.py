from app.extensions import db

class GioHang(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'gio_hang'

    id = db.Column(db.Integer, primary_key=True)
    
    # Khóa ngoại, liên kết tới bảng 'nguoi_dung'
    ma_nguoi_dung = db.Column(db.Integer, db.ForeignKey('nguoi_dung.id'), nullable=False, unique=True)

    # --- Các mối quan hệ (Relationships) ---
    
    # Quan hệ một-một ngược lại với class 'NguoiDung'.
    # 'gio_hang' là tên thuộc tính trong class NguoiDung để gọi lại.
    nguoi_dung = db.relationship('NguoiDung', back_populates='gio_hang')
    
    # Một giỏ hàng có nhiều mục.
    # 'MucGioHang' là tên class chứa các mục trong giỏ hàng.
    # 'gio_hang' là tên thuộc tính trong class MucGioHang để gọi lại.
    cac_muc = db.relationship('MucGioHang', back_populates='gio_hang', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Giỏ hàng của Người dùng ID {self.ma_nguoi_dung}>'
