use myshop;
INSERT INTO danh_muc (id, ma_danh_muc, ten_danh_muc)
VALUES (1, 'DM001', 'Máy ảnh DSLR'),
    (2, 'DM002', 'Máy ảnh Mirrorless'),
    (3, 'DM003', 'Máy ảnh Compact'),
    (4, 'DM004', 'Ống kính'),
    (5, 'DM005', 'Phụ kiện'),
    (6, 'DM006', 'Máy quay phim'),
    (7, 'DM007', 'Máy ảnh Film'),
    (8, 'DM008', 'Thiết bị ánh sáng'),
    (9, 'DM009', 'Tripod'),
    (10, 'DM010', 'Balo và Túi đựng');
INSERT INTO thuong_hieu (
        id,
        ma_thuong_hieu,
        ten_thuong_hieu,
        logo_url,
        public_id
    )
VALUES (
        1,
        'TH001',
        'Canon',
        'https://example.com/logo/canon.png',
        'canon_logo'
    ),
    (
        2,
        'TH002',
        'Nikon',
        'https://example.com/logo/nikon.png',
        'nikon_logo'
    ),
    (
        3,
        'TH003',
        'Sony',
        'https://example.com/logo/sony.png',
        'sony_logo'
    ),
    (
        4,
        'TH004',
        'Fujifilm',
        'https://example.com/logo/fujifilm.png',
        'fujifilm_logo'
    ),
    (
        5,
        'TH005',
        'Panasonic',
        'https://example.com/logo/panasonic.png',
        'panasonic_logo'
    ),
    (
        6,
        'TH006',
        'Olympus',
        'https://example.com/logo/olympus.png',
        'olympus_logo'
    ),
    (
        7,
        'TH007',
        'Leica',
        'https://example.com/logo/leica.png',
        'leica_logo'
    ),
    (
        8,
        'TH008',
        'GoPro',
        'https://example.com/logo/gopro.png',
        'gopro_logo'
    ),
    (
        9,
        'TH009',
        'Sigma',
        'https://example.com/logo/sigma.png',
        'sigma_logo'
    ),
    (
        10,
        'TH010',
        'Tamron',
        'https://example.com/logo/tamron.png',
        'tamron_logo'
    );
INSERT INTO cap_do (id, ma_cap_do, ten_cap_do)
VALUES (1, 'CD001', 'Mới bắt đầu'),
    (2, 'CD002', 'Nghiệp dư'),
    (3, 'CD003', 'Bán chuyên'),
    (4, 'CD004', 'Chuyên nghiệp'),
    (5, 'CD005', 'Cao cấp'),
    (6, 'CD006', 'Nhập môn'),
    (7, 'CD007', 'Trung cấp'),
    (8, 'CD008', 'Nâng cao'),
    (9, 'CD009', 'Expert'),
    (10, 'CD010', 'Master');
INSERT INTO san_pham (
        id,
        ma_san_pham,
        danh_muc_id,
        thuong_hieu_id,
        cap_do_id,
        ten_san_pham,
        mo_ta,
        thong_so_ky_thuat,
        ngay_tao,
        ngay_cap_nhat
    )
VALUES (
        1,
        'SP001',
        1,
        1,
        4,
        'Canon EOS 5D Mark IV',
        'Máy ảnh full-frame chuyên nghiệp',
        '{"Cảm biến": "Full-frame 30.4MP", "ISO": "100-32000", "Màn hình": "3.2 inch"}',
        NOW(),
        NOW()
    ),
    (
        2,
        'SP002',
        2,
        3,
        4,
        'Sony A7 III',
        'Mirrorless full-frame',
        '{"Cảm biến": "Full-frame 24.2MP", "ISO": "100-51200", "Màn hình": "3 inch"}',
        NOW(),
        NOW()
    ),
    (
        3,
        'SP003',
        1,
        2,
        3,
        'Nikon D750',
        'Máy ảnh DSLR full-frame',
        '{"Cảm biến": "Full-frame 24.3MP", "ISO": "100-12800", "Màn hình": "3.2 inch"}',
        NOW(),
        NOW()
    ),
    (
        4,
        'SP004',
        4,
        1,
        4,
        'Canon EF 24-70mm f/2.8L II USM',
        'Ống kính zoom tiêu chuẩn',
        '{"Tiêu cự": "24-70mm", "Khẩu độ": "f/2.8", "Ổn định hình ảnh": "Không"}',
        NOW(),
        NOW()
    ),
    (
        5,
        'SP005',
        4,
        3,
        4,
        'Sony FE 70-200mm f/2.8 GM OSS',
        'Ống kính tele zoom',
        '{"Tiêu cự": "70-200mm", "Khẩu độ": "f/2.8", "Ổn định hình ảnh": "Có"}',
        NOW(),
        NOW()
    ),
    (
        6,
        'SP006',
        3,
        4,
        2,
        'Fujifilm X100V',
        'Máy ảnh compact cao cấp',
        '{"Cảm biến": "APS-C 26.1MP", "ISO": "160-12800", "Màn hình": "3 inch"}',
        NOW(),
        NOW()
    ),
    (
        7,
        'SP007',
        5,
        8,
        1,
        'GoPro Hero 9',
        'Máy quay hành động',
        '{"Độ phân giải": "5K", "Chống nước": "10m", "Màn hình": "2 inch"}',
        NOW(),
        NOW()
    ),
    (
        8,
        'SP008',
        6,
        5,
        3,
        'Panasonic HC-VX1',
        'Máy quay phim',
        '{"Độ phân giải": "4K", "Cảm biến": "1/2.3 inch", "Zoom": "20x"}',
        NOW(),
        NOW()
    ),
    (
        9,
        'SP009',
        7,
        6,
        4,
        'Olympus OM-D E-M1 Mark III',
        'Máy ảnh Mirrorless',
        '{"Cảm biến": "Micro Four Thirds 20.4MP", "ISO": "200-25600", "Màn hình": "3 inch"}',
        NOW(),
        NOW()
    ),
    (
        10,
        'SP010',
        8,
        7,
        5,
        'Leica M10',
        'Máy ảnh rangefinder',
        '{"Cảm biến": "Full-frame 24MP", "ISO": "100-50000", "Màn hình": "3 inch"}',
        NOW(),
        NOW()
    );
INSERT INTO bien_the_san_pham (
        id,
        san_pham_id,
        ten_bien_the,
        trang_thai_kich_hoat,
        gia_ban,
        mau,
        so_luong
    )
VALUES (
        1,
        1,
        'Canon EOS 5D Mark IV - Đen',
        'dang_ban',
        45000000,
        'Đen',
        10
    ),
    (
        2,
        1,
        'Canon EOS 5D Mark IV - Xám',
        'dang_ban',
        45000000,
        'Xám',
        5
    ),
    (
        3,
        2,
        'Sony A7 III - Đen',
        'dang_ban',
        35000000,
        'Đen',
        8
    ),
    (
        4,
        2,
        'Sony A7 III - Bạc',
        'sap_ban',
        35000000,
        'Bạc',
        0
    ),
    (
        5,
        3,
        'Nikon D750 - Đen',
        'dang_ban',
        25000000,
        'Đen',
        12
    ),
    (
        6,
        4,
        'Canon EF 24-70mm f/2.8L II USM',
        'dang_ban',
        40000000,
        'Đen',
        7
    ),
    (
        7,
        5,
        'Sony FE 70-200mm f/2.8 GM OSS',
        'dang_ban',
        60000000,
        'Trắng',
        3
    ),
    (
        8,
        6,
        'Fujifilm X100V - Bạc',
        'dang_ban',
        28000000,
        'Bạc',
        6
    ),
    (
        9,
        7,
        'GoPro Hero 9 - Đen',
        'dang_ban',
        8000000,
        'Đen',
        20
    ),
    (
        10,
        8,
        'Panasonic HC-VX1 - Đen',
        'ngung_ban',
        15000000,
        'Đen',
        0
    );
INSERT INTO hinh_anh_san_pham (
        id,
        bien_the_id,
        url,
        public_id,
        alt_text,
        thu_tu,
        la_anh_dai_dien
    )
VALUES (
        1,
        1,
        'https://example.com/images/canon_5d_iv_1.jpg',
        'canon_5d_iv_1',
        'Canon EOS 5D Mark IV màu đen',
        1,
        TRUE
    ),
    (
        2,
        1,
        'https://example.com/images/canon_5d_iv_2.jpg',
        'canon_5d_iv_2',
        'Canon EOS 5D Mark IV góc nghiêng',
        2,
        FALSE
    ),
    (
        3,
        2,
        'https://example.com/images/canon_5d_iv_gray_1.jpg',
        'canon_5d_iv_gray_1',
        'Canon EOS 5D Mark IV màu xám',
        1,
        TRUE
    ),
    (
        4,
        3,
        'https://example.com/images/sony_a7iii_1.jpg',
        'sony_a7iii_1',
        'Sony A7 III màu đen',
        1,
        TRUE
    ),
    (
        5,
        4,
        'https://example.com/images/sony_a7iii_silver_1.jpg',
        'sony_a7iii_silver_1',
        'Sony A7 III màu bạc',
        1,
        TRUE
    ),
    (
        6,
        5,
        'https://example.com/images/nikon_d750_1.jpg',
        'nikon_d750_1',
        'Nikon D750 màu đen',
        1,
        TRUE
    ),
    (
        7,
        6,
        'https://example.com/images/canon_24_70_1.jpg',
        'canon_24_70_1',
        'Canon EF 24-70mm f/2.8L II USM',
        1,
        TRUE
    ),
    (
        8,
        7,
        'https://example.com/images/sony_70_200_1.jpg',
        'sony_70_200_1',
        'Sony FE 70-200mm f/2.8 GM OSS',
        1,
        TRUE
    ),
    (
        9,
        8,
        'https://example.com/images/fujifilm_x100v_1.jpg',
        'fujifilm_x100v_1',
        'Fujifilm X100V màu bạc',
        1,
        TRUE
    ),
    (
        10,
        9,
        'https://example.com/images/gopro_hero9_1.jpg',
        'gopro_hero9_1',
        'GoPro Hero 9 màu đen',
        1,
        TRUE
    );
INSERT INTO nguoi_dung (
        id,
        ma_nguoi_dung,
        ho_ten,
        so_dien_thoai,
        email,
        mat_khau_hash,
        lan_cuoi_dang_nhap,
        vai_tro,
        trang_thai,
        ngay_tao,
        ngay_cap_nhat
    )
VALUES (
        1,
        'KH001',
        'Nguyễn Văn A',
        '0901234567',
        'nguyenvana@example.com',
        'hashed_password_1',
        NOW(),
        'khach_hang',
        'kich_hoat',
        NOW(),
        NOW()
    ),
    (
        2,
        'KH002',
        'Trần Thị B',
        '0901234568',
        'tranthib@example.com',
        'hashed_password_2',
        NOW(),
        'khach_hang',
        'kich_hoat',
        NOW(),
        NOW()
    ),
    (
        3,
        'KH003',
        'Lê Văn C',
        '0901234569',
        'levanc@example.com',
        'hashed_password_3',
        NOW(),
        'khach_hang',
        'kich_hoat',
        NOW(),
        NOW()
    ),
    (
        4,
        'KH004',
        'Phạm Thị D',
        '0901234570',
        'phamthid@example.com',
        'hashed_password_4',
        NOW(),
        'khach_hang',
        'kich_hoat',
        NOW(),
        NOW()
    ),
    (
        5,
        'KH005',
        'Hoàng Văn E',
        '0901234571',
        'hoangvane@example.com',
        'hashed_password_5',
        NOW(),
        'khach_hang',
        'kich_hoat',
        NOW(),
        NOW()
    ),
    (
        6,
        'KH006',
        'Vũ Thị F',
        '0901234572',
        'vuthif@example.com',
        'hashed_password_6',
        NOW(),
        'khach_hang',
        'kich_hoat',
        NOW(),
        NOW()
    ),
    (
        7,
        'KH007',
        'Đặng Văn G',
        '0901234573',
        'dangvang@example.com',
        'hashed_password_7',
        NOW(),
        'khach_hang',
        'kich_hoat',
        NOW(),
        NOW()
    ),
    (
        8,
        'KH008',
        'Bùi Thị H',
        '0901234574',
        'buithih@example.com',
        'hashed_password_8',
        NOW(),
        'khach_hang',
        'kich_hoat',
        NOW(),
        NOW()
    ),
    (
        9,
        'KH009',
        'Đỗ Văn I',
        '0901234575',
        'dovani@example.com',
        'hashed_password_9',
        NOW(),
        'khach_hang',
        'kich_hoat',
        NOW(),
        NOW()
    ),
    (
        10,
        'QT001',
        'Admin System',
        '0901234576',
        'admin@example.com',
        'hashed_password_10',
        NOW(),
        'quan_tri_vien',
        'kich_hoat',
        NOW(),
        NOW()
    );
INSERT INTO dia_chi (
        id,
        nguoi_dung_id,
        ten_nguoi_nhan,
        so_dien_thoai,
        phuong_xa,
        tinh_thanh,
        dia_chi_cu_the,
        ma_buu_dien,
        la_mac_dinh,
        ngay_tao,
        ngay_cap_nhat
    )
VALUES (
        1,
        1,
        'Nguyễn Văn A',
        '0901234567',
        'Phường 1',
        'Quận 1',
        '123 Đường ABC',
        '700000',
        TRUE,
        NOW(),
        NOW()
    ),
    (
        2,
        1,
        'Nguyễn Văn A',
        '0901234567',
        'Phường 2',
        'Quận 3',
        '456 Đường DEF',
        '700000',
        FALSE,
        NOW(),
        NOW()
    ),
    (
        3,
        2,
        'Trần Thị B',
        '0901234568',
        'Phường 3',
        'Quận 5',
        '789 Đường GHI',
        '700000',
        TRUE,
        NOW(),
        NOW()
    ),
    (
        4,
        3,
        'Lê Văn C',
        '0901234569',
        'Phường 4',
        'Quận 7',
        '321 Đường JKL',
        '700000',
        TRUE,
        NOW(),
        NOW()
    ),
    (
        5,
        4,
        'Phạm Thị D',
        '0901234570',
        'Phường 5',
        'Quận 10',
        '654 Đường MNO',
        '700000',
        TRUE,
        NOW(),
        NOW()
    ),
    (
        6,
        5,
        'Hoàng Văn E',
        '0901234571',
        'Phường 6',
        'Quận Bình Thạnh',
        '987 Đường PQR',
        '700000',
        TRUE,
        NOW(),
        NOW()
    ),
    (
        7,
        6,
        'Vũ Thị F',
        '0901234572',
        'Phường 7',
        'Quận Tân Bình',
        '159 Đường STU',
        '700000',
        TRUE,
        NOW(),
        NOW()
    ),
    (
        8,
        7,
        'Đặng Văn G',
        '0901234573',
        'Phường 8',
        'Quận Phú Nhuận',
        '753 Đường VWX',
        '700000',
        TRUE,
        NOW(),
        NOW()
    ),
    (
        9,
        8,
        'Bùi Thị H',
        '0901234574',
        'Phường 9',
        'Quận Gò Vấp',
        '852 Đường YZ',
        '700000',
        TRUE,
        NOW(),
        NOW()
    ),
    (
        10,
        9,
        'Đỗ Văn I',
        '0901234575',
        'Phường 10',
        'Quận 12',
        '951 Đường ABC',
        '700000',
        TRUE,
        NOW(),
        NOW()
    );
INSERT INTO gio_hang (id, nguoi_dung_id)
VALUES (1, 1),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 5),
    (6, 6),
    (7, 7),
    (8, 8),
    (9, 9);
-- Chú ý: Admin (id 10) có thể không có giỏ hàng, hoặc có thể tùy, nhưng ở đây tôi chỉ tạo cho khách hàng.
INSERT INTO chi_tiet_gio_hang (
        id,
        gio_hang_id,
        bien_the_san_pham_id,
        so_luong,
        ngay_them
    )
VALUES (1, 1, 1, 1, NOW()),
    (2, 1, 3, 2, NOW()),
    (3, 2, 5, 1, NOW()),
    (4, 3, 2, 1, NOW()),
    (5, 4, 6, 1, NOW()),
    (6, 5, 7, 1, NOW()),
    (7, 6, 8, 1, NOW()),
    (8, 7, 9, 1, NOW()),
    (9, 8, 10, 1, NOW()),
    (10, 9, 4, 1, NOW());
INSERT INTO don_hang (
        id,
        ma_don_hang,
        nguoi_dung_id,
        dia_chi_id,
        ten_nguoi_nhan,
        so_dien_thoai_nguoi_nhan,
        dia_chi_giao,
        trang_thai,
        phi_van_chuyen,
        ghi_chu,
        ly_do,
        ngay_tao,
        ngay_cap_nhat
    )
VALUES (
        1,
        'DH001',
        1,
        1,
        'Nguyễn Văn A',
        '0901234567',
        '123 Đường ABC, Phường 1, Quận 1',
        'da_giao',
        20000,
        'Giao hàng giờ hành chính',
        NULL,
        NOW(),
        NOW()
    ),
    (
        2,
        'DH002',
        2,
        3,
        'Trần Thị B',
        '0901234568',
        '789 Đường GHI, Phường 3, Quận 5',
        'dang_giao',
        20000,
        NULL,
        NULL,
        NOW(),
        NOW()
    ),
    (
        3,
        'DH003',
        3,
        4,
        'Lê Văn C',
        '0901234569',
        '321 Đường JKL, Phường 4, Quận 7',
        'cho_xac_nhan',
        20000,
        NULL,
        NULL,
        NOW(),
        NOW()
    ),
    (
        4,
        'DH004',
        4,
        5,
        'Phạm Thị D',
        '0901234570',
        '654 Đường MNO, Phường 5, Quận 10',
        'da_xac_nhan',
        20000,
        NULL,
        NULL,
        NOW(),
        NOW()
    ),
    (
        5,
        'DH005',
        5,
        6,
        'Hoàng Văn E',
        '0901234571',
        '987 Đường PQR, Phường 6, Quận Bình Thạnh',
        'da_huy',
        20000,
        NULL,
        'Không liên lạc được',
        NOW(),
        NOW()
    ),
    (
        6,
        'DH006',
        6,
        7,
        'Vũ Thị F',
        '0901234572',
        '159 Đường STU, Phường 7, Quận Tân Bình',
        'yeu_cau_doi_tra',
        20000,
        NULL,
        NULL,
        NOW(),
        NOW()
    ),
    (
        7,
        'DH007',
        7,
        8,
        'Đặng Văn G',
        '0901234573',
        '753 Đường VWX, Phường 8, Quận Phú Nhuận',
        'chap_nhan_doi_tra',
        20000,
        NULL,
        NULL,
        NOW(),
        NOW()
    ),
    (
        8,
        'DH008',
        8,
        9,
        'Bùi Thị H',
        '0901234574',
        '852 Đường YZ, Phường 9, Quận Gò Vấp',
        'tu_choi_doi_tra',
        20000,
        NULL,
        NULL,
        NOW(),
        NOW()
    ),
    (
        9,
        'DH009',
        9,
        10,
        'Đỗ Văn I',
        '0901234575',
        '951 Đường ABC, Phường 10, Quận 12',
        'da_hoan_tien',
        20000,
        NULL,
        NULL,
        NOW(),
        NOW()
    ),
    (
        10,
        'DH010',
        1,
        2,
        'Nguyễn Văn A',
        '0901234567',
        '456 Đường DEF, Phường 2, Quận 3',
        'da_giao',
        20000,
        NULL,
        NULL,
        NOW(),
        NOW()
    );
INSERT INTO chi_tiet_don_hang (
        id,
        don_hang_id,
        bien_the_san_pham_id,
        ten_san_pham_luc_mua,
        don_gia_luc_mua,
        so_luong
    )
VALUES (
        1,
        1,
        1,
        'Canon EOS 5D Mark IV - Đen',
        45000000,
        1
    ),
    (2, 1, 3, 'Sony A7 III - Đen', 35000000, 1),
    (3, 2, 5, 'Nikon D750 - Đen', 25000000, 1),
    (
        4,
        3,
        2,
        'Canon EOS 5D Mark IV - Xám',
        45000000,
        1
    ),
    (
        5,
        4,
        6,
        'Canon EF 24-70mm f/2.8L II USM',
        40000000,
        1
    ),
    (
        6,
        5,
        7,
        'Sony FE 70-200mm f/2.8 GM OSS',
        60000000,
        1
    ),
    (7, 6, 8, 'Fujifilm X100V - Bạc', 28000000, 1),
    (8, 7, 9, 'GoPro Hero 9 - Đen', 8000000, 1),
    (9, 8, 10, 'Panasonic HC-VX1 - Đen', 15000000, 1),
    (10, 9, 4, 'Sony A7 III - Bạc', 35000000, 1);
INSERT INTO thanh_toan (
        id,
        don_hang_id,
        so_tien,
        phuong_thuc,
        trang_thai,
        ma_giao_dich_ben_thu_3,
        ngay_tao,
        ngay_cap_nhat
    )
VALUES (
        1,
        1,
        45020000,
        'cod',
        'da_thanh_toan',
        NULL,
        NOW(),
        NOW()
    ),
    (
        2,
        2,
        25020000,
        'vnpay_qr',
        'da_thanh_toan',
        'VNPAY123456',
        NOW(),
        NOW()
    ),
    (
        3,
        3,
        45020000,
        'payos_qr',
        'cho_thanh_toan',
        NULL,
        NOW(),
        NOW()
    ),
    (
        4,
        4,
        40020000,
        'cod',
        'da_thanh_toan',
        NULL,
        NOW(),
        NOW()
    ),
    (
        5,
        5,
        60020000,
        'vnpay_ewallet',
        'that_bai',
        NULL,
        NOW(),
        NOW()
    ),
    (
        6,
        6,
        28020000,
        'cod',
        'da_thanh_toan',
        NULL,
        NOW(),
        NOW()
    ),
    (
        7,
        7,
        8002000,
        'cod',
        'da_hoan_tien',
        NULL,
        NOW(),
        NOW()
    ),
    (
        8,
        8,
        15020000,
        'cod',
        'da_thanh_toan',
        NULL,
        NOW(),
        NOW()
    ),
    (
        9,
        9,
        35020000,
        'vnpay_qr',
        'da_hoan_tien',
        'VNPAY789012',
        NOW(),
        NOW()
    ),
    (
        10,
        10,
        45020000,
        'cod',
        'da_thanh_toan',
        NULL,
        NOW(),
        NOW()
    );
INSERT INTO danh_gia (
        id,
        chi_tiet_don_hang_id,
        san_pham_id,
        nguoi_dung_id,
        diem_danh_gia,
        binh_luan,
        trang_thai,
        ngay_tao,
        ngay_cap_nhat
    )
VALUES (
        1,
        1,
        1,
        1,
        5,
        'Sản phẩm tuyệt vời, hình ảnh sắc nét',
        'da_duyet',
        NOW(),
        NOW()
    ),
    (
        2,
        2,
        2,
        1,
        4,
        'Máy tốt, nhưng hơi nặng',
        'da_duyet',
        NOW(),
        NOW()
    ),
    (
        3,
        3,
        3,
        2,
        5,
        'Máy phù hợp với nhu cầu',
        'da_duyet',
        NOW(),
        NOW()
    ),
    (
        4,
        4,
        1,
        3,
        4,
        'Màu sắc đẹp, chất lượng tốt',
        'da_duyet',
        NOW(),
        NOW()
    ),
    (
        5,
        5,
        4,
        4,
        5,
        'Ống kính sắc nét, build chất lượng',
        'da_duyet',
        NOW(),
        NOW()
    ),
    (
        6,
        6,
        5,
        5,
        3,
        'Sản phẩm tốt nhưng giá hơi cao',
        'da_duyet',
        NOW(),
        NOW()
    ),
    (
        7,
        7,
        6,
        6,
        4,
        'Máy đẹp, nhỏ gọn',
        'da_duyet',
        NOW(),
        NOW()
    ),
    (
        8,
        8,
        7,
        7,
        5,
        'Quay phim rất tốt, chống nước tốt',
        'da_duyet',
        NOW(),
        NOW()
    ),
    (
        9,
        9,
        8,
        8,
        2,
        'Máy cũ, không như mô tả',
        'bi_tu_choi',
        NOW(),
        NOW()
    ),
    (
        10,
        10,
        2,
        9,
        5,
        'Giao hàng nhanh, sản phẩm chất lượng',
        'da_duyet',
        NOW(),
        NOW()
    );
INSERT INTO phieu_thu (
        id,
        nguoi_nhap_id,
        ma_phieu_thu,
        ten_nha_cung_cap,
        ngay_thu,
        ngay_cap_nhat
    )
VALUES (
        1,
        10,
        'PT001',
        'Công ty TNHH Canon Việt Nam',
        NOW(),
        NOW()
    ),
    (
        2,
        10,
        'PT002',
        'Công ty TNHH Sony Việt Nam',
        NOW(),
        NOW()
    ),
    (
        3,
        10,
        'PT003',
        'Công ty TNHH Nikon Việt Nam',
        NOW(),
        NOW()
    ),
    (
        4,
        10,
        'PT004',
        'Công ty TNHH Fujifilm Việt Nam',
        NOW(),
        NOW()
    ),
    (
        5,
        10,
        'PT005',
        'Công ty TNHH Panasonic Việt Nam',
        NOW(),
        NOW()
    ),
    (
        6,
        10,
        'PT006',
        'Công ty TNHH Olympus Việt Nam',
        NOW(),
        NOW()
    ),
    (
        7,
        10,
        'PT007',
        'Công ty TNHH Leica Việt Nam',
        NOW(),
        NOW()
    ),
    (
        8,
        10,
        'PT008',
        'Công ty TNHH GoPro Việt Nam',
        NOW(),
        NOW()
    ),
    (
        9,
        10,
        'PT009',
        'Công ty TNHH Sigma Việt Nam',
        NOW(),
        NOW()
    ),
    (
        10,
        10,
        'PT010',
        'Công ty TNHH Tamron Việt Nam',
        NOW(),
        NOW()
    );
INSERT INTO chi_tiet_phieu_thu (
        id,
        phieu_thu_id,
        bien_the_san_pham_id,
        so_luong,
        gia_nhap_tung_vat,
        ngay_cap_nhat
    )
VALUES (1, 1, 1, 5, 40000000, NOW()),
    (2, 1, 2, 3, 40000000, NOW()),
    (3, 2, 3, 5, 30000000, NOW()),
    (4, 2, 4, 2, 30000000, NOW()),
    (5, 3, 5, 10, 20000000, NOW()),
    (6, 4, 8, 5, 25000000, NOW()),
    (7, 5, 10, 3, 12000000, NOW()),
    (8, 6, 9, 10, 7000000, NOW()),
    (9, 7, 10, 2, 10000000, NOW()),
    (10, 8, 9, 5, 7000000, NOW());