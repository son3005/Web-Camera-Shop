from sqlalchemy import event
from app.extensions import db
from app.utils.slug import generate_slug # Giả sử bạn có một hàm tạo slug

class DanhMuc(db.Model):
    __tablename__ = 'danh_muc' # ĐỀ XUẤT: Dùng snake_case cho tên bảng

    # ĐỀ XUẤT: Dùng Integer làm khóa chính cho nhất quán và hiệu năng
    # Ví dụ: new_category = DanhMuc(id='MAYAN', ten_danh_muc='Máy Ảnh')
    id = db.Column(db.Integer, primary_key=True)
    ma_danh_muc = db.Column(db.String(10), unique=True, nullable=False, index=True)
    ten_danh_muc = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(150), unique=True, nullable=False, index=True)

    # --- Mối quan hệ ---
    # lazy='dynamic' tốt khi bạn muốn thêm các filter trên tập hợp sản phẩm này
    # Ví dụ: category.san_phams.filter_by(trang_thai='DANG_BAN').all()
    san_phams = db.relationship('SanPham', back_populates='danh_muc', lazy='dynamic')

    def __repr__(self):
        return f'<Danh mục {self.ten_danh_muc}>'

# TỰ ĐỘNG TẠO SLUG: Dùng SQLAlchemy event để tự động tạo slug
# Event này sẽ được kích hoạt trước khi một đối tượng DanhMuc được insert vào DB
@event.listens_for(DanhMuc, 'before_insert')
def before_insert_listener(mapper, connection, target):
    if target.ten_danh_muc and not target.slug:
        target.slug = generate_slug(target.ten_danh_muc, DanhMuc)

# Event này sẽ được kích hoạt trước khi một đối tượng DanhMuc được update
@event.listens_for(DanhMuc, 'before_update')
def before_update_listener(mapper, connection, target):
    if target.ten_danh_muc and not target.slug: # Hoặc nếu bạn muốn slug thay đổi khi tên thay đổi
        target.slug = generate_slug(target.ten_danh_muc, DanhMuc)