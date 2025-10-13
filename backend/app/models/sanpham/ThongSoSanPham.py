from app.extensions import db

class ThongSoSanPham(db.Model):
    # Tên bảng trong cơ sở dữ liệu
    __tablename__ = 'thong_so_san_pham'

    id = db.Column(db.Integer, primary_key=True)
    # Khóa ngoại, liên kết 1-1 với bảng 'san_pham'
    ma_san_pham = db.Column(db.Integer, db.ForeignKey('san_pham.id'), nullable=False, unique=True)

    # --- Thông số Kỹ thuật ---
    
    # == Ánh sáng ==
    iso = db.Column(db.String(100), comment="ISO")
    toc_do_man_trap = db.Column(db.String(100), comment="Tốc Độ Màn Trập")
    do_sang = db.Column(db.String(100), comment="Đo Sáng")
    can_bang_trang = db.Column(db.String(100), comment="Cân Bằng Trắng")
    toc_do_chup_lien_tuc = db.Column(db.String(100), comment="Tốc Độ Chụp Liên Tục")

    # == Hình ảnh ==
    dinh_dang_cam_bien = db.Column(db.String(100), comment="Định Dạng Cảm Biến")
    do_phan_giai = db.Column(db.String(100), comment="Độ Phân Giải")
    kich_thuoc_anh = db.Column(db.String(100), comment="Kích Thước Ảnh")
    ty_le_anh = db.Column(db.String(50), comment="Tỷ Lệ Ảnh")
    loai_cam_bien = db.Column(db.String(100), comment="Loại Cảm Biến")
    dinh_dang_anh = db.Column(db.String(100), comment="Định Dạng Ảnh")
    chong_rung = db.Column(db.String(100), comment="Chống Rung")
    ngam_ong_kinh = db.Column(db.String(100), comment="Ngàm Ống Kính")

    # == Video ==
    ma_hoa_video = db.Column(db.String(100), comment="Mã Hóa Video")
    do_phan_giai_video = db.Column(db.String(100), comment="Độ Phân Giải Video")
    micro = db.Column(db.String(100), comment="Micro")
    dinh_dang_am_thanh = db.Column(db.String(100), comment="Định Dạng Âm Thanh")

    # == Lấy nét ==
    kieu_lay_net = db.Column(db.String(100), comment="Kiểu Lấy Nét")
    che_do_lay_net = db.Column(db.String(100), comment="Chế Độ Lấy Nét")
    so_diem_lay_net = db.Column(db.String(100), comment="Số Điểm Lấy Nét")

    # == Kính ngắm/Màn hình ==
    loai_kinh_ngam = db.Column(db.String(100), comment="Loại kính ngắm")
    dac_tinh_man_hinh = db.Column(db.String(200), comment="Đặc Tính Màn Hình")
    do_phan_giai_man_hinh = db.Column(db.String(100), comment="Độ Phân Giải Màn Hình")
    kich_thuoc_man_hinh = db.Column(db.String(50), comment="Kích Thước Màn Hình")
    do_phong_dai_kinh_ngam = db.Column(db.String(50), comment="Độ Phóng Đại Kính Ngắm")
    do_bao_phu_kinh_ngam = db.Column(db.String(50), comment="Độ Bao Phủ Kính Ngắm")
    kich_thuoc_kinh_ngam = db.Column(db.String(50), comment="Kích Thước Kính Ngắm")
    do_phan_giai_kinh_ngam = db.Column(db.String(100), comment="Độ Phân Giải Kính Ngắm")

    # == Đèn Flash ==
    den_flash = db.Column(db.String(100), comment="Đèn Flash")
    che_do_flash = db.Column(db.String(100), comment="Chế Độ Flash")
    toc_do_danh_den = db.Column(db.String(100), comment="Tốc Độ Đánh Đèn")
    chan_ket_noi = db.Column(db.String(100), comment="Chân Kết Nối")
    do_bu_sang = db.Column(db.String(100), comment="Độ Bù Sáng")
    dong_bo_flash = db.Column(db.String(100), comment="Đồng Bộ Flash")

    # == Kết Nối ==
    gps = db.Column(db.String(100), comment="GPS")
    ket_noi_khong_day = db.Column(db.String(150), comment="Kết Nối Không Dây")
    jack_cam = db.Column(db.String(150), comment="Jack Cắm")
    so_khe_cam_the_nho = db.Column(db.String(100), comment="Số Khe Cắm Thẻ Nhớ")

    # == Thông tin vật lý ==
    trong_luong = db.Column(db.String(100), comment="Trọng Lượng")
    kich_thuoc = db.Column(db.String(100), comment="Kích Thước")
    pin = db.Column(db.String(100), comment="Pin")
    
    # --- Mối quan hệ (Relationship) ---
    # Mối quan hệ ngược lại với SanPham
    san_pham = db.relationship('SanPham', back_populates='thong_so')
    
    def __repr__(self):
        return f'<Thông số SP cho Sản phẩm ID {self.ma_san_pham}>'