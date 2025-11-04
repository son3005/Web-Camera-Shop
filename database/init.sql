use myshop;
-- 1. DANH_MUC
INSERT INTO danh_muc (id, ma_danh_muc, ten_danh_muc)
VALUES (1, 'DM001', 'Máy ảnh DSLR'),
    (2, 'DM002', 'Máy ảnh Mirrorless'),
    (3, 'DM003', 'Máy ảnh Compact'),
    (4, 'DM004', 'Máy ảnh Film'),
    (5, 'DM005', 'Máy ảnh Action'),
    (6, 'DM006', 'Máy ảnh Instant'),
    (7, 'DM007', 'Máy ảnh Medium Format'),
    (8, 'DM008', 'Máy ảnh Drone'),
    (9, 'DM009', 'Máy ảnh 360'),
    (10, 'DM010', 'Máy ảnh Smartphone');
-- 2. THUONG_HIEU
INSERT INTO thuong_hieu (id, ma_thuong_hieu, ten_thuong_hieu)
VALUES (1, 'TH001', 'Canon'),
    (2, 'TH002', 'Nikon'),
    (3, 'TH003', 'Sony'),
    (4, 'TH004', 'Fujifilm'),
    (5, 'TH005', 'Panasonic'),
    (6, 'TH006', 'Olympus'),
    (7, 'TH007', 'Leica'),
    (8, 'TH008', 'GoPro'),
    (9, 'TH009', 'DJI'),
    (10, 'TH010', 'Insta360');
-- 3. CAP_DO
INSERT INTO cap_do (id, ma_cap_do, ten_cap_do)
VALUES (1, 'CD001', 'Nhập môn'),
    (2, 'CD002', 'Đam mê'),
    (3, 'CD003', 'Bán chuyên'),
    (4, 'CD004', 'Chuyên nghiệp'),
    (5, 'CD005', 'Cao cấp');
-- 4. SAN_PHAM
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
        'CANON_EOS_R5',
        1,
        1,
        4,
        'Canon EOS R5',
        'Máy ảnh mirrorless full-frame chuyên nghiệp',
        '{"Cảm biến": "Full-frame 45MP", "ISO": "100-51200", "Tốc độ chụp": "20 fps"}',
        NOW(),
        NOW()
    ),
    (
        2,
        'SONY_A7IV',
        2,
        3,
        4,
        'Sony A7 IV',
        'Máy ảnh mirrorless đa năng',
        '{"Cảm biến": "Full-frame 33MP", "ISO": "100-51200", "Tốc độ chụp": "10 fps"}',
        NOW(),
        NOW()
    ),
    (
        3,
        'NIKON_Z9',
        2,
        2,
        5,
        'Nikon Z9',
        'Flagship mirrorless không kính ngắm',
        '{"Cảm biến": "Stacked CMOS 45.7MP", "ISO": "64-25600", "Tốc độ chụp": "120 fps"}',
        NOW(),
        NOW()
    ),
    (
        4,
        'FUJI_XT5',
        2,
        4,
        3,
        'Fujifilm X-T5',
        'Máy ảnh APS-C cổ điển',
        '{"Cảm biến": "APS-C 40MP", "ISO": "125-12800", "Tốc độ chụp": "15 fps"}',
        NOW(),
        NOW()
    ),
    (
        5,
        'GOPRO_HERO12',
        5,
        8,
        2,
        'GoPro Hero 12',
        'Máy ảnh hành động 4K',
        '{"Độ phân giải": "5.3K60P", "Chống nước": "10m", "Ổn định hình": "HyperSmooth 6.0"}',
        NOW(),
        NOW()
    ),
    (
        6,
        'LEICA_M11',
        4,
        7,
        5,
        'Leica M11',
        'Máy ảnh rangefinder digital',
        '{"Cảm biến": "Full-frame 60MP", "ISO": "64-50000", "Màn hình": "2.95 inch"}',
        NOW(),
        NOW()
    ),
    (
        7,
        'DJI_MAVIC3',
        8,
        9,
        4,
        'DJI Mavic 3',
        'Máy ảnh drone chuyên nghiệp',
        '{"Camera": "Hasselblad 4/3 CMOS", "Bay": "46 phút", "Truyền": "15 km"}',
        NOW(),
        NOW()
    ),
    (
        8,
        'INSTA360_X3',
        9,
        10,
        3,
        'Insta360 X3',
        'Máy ảnh 360 độ',
        '{"Độ phân giải": "5.7K", "Chống nước": "10m", "Chế độ": "360/4K"}',
        NOW(),
        NOW()
    ),
    (
        9,
        'OLYMPUS_OM1',
        2,
        6,
        3,
        'Olympus OM-1',
        'Máy ảnh Micro Four Thirds',
        '{"Cảm biến": "20MP Stacked CMOS", "ISO": "200-25600", "Chống rung": "7.5 stops"}',
        NOW(),
        NOW()
    ),
    (
        10,
        'PANASONIC_S5II',
        2,
        5,
        3,
        'Panasonic Lumix S5II',
        'Máy ảnh full-frame hybrid',
        '{"Cảm biến": "24MP CMOS", "ISO": "100-51200", "AF": "PDAF 779 điểm"}',
        NOW(),
        NOW()
    );
-- 5. BIEN_THE_SAN_PHAM
INSERT INTO bien_the_san_pham (
        id,
        san_pham_id,
        ten_bien_the,
        trang_thai_kich_hoat,
        gia_ban,
        mau,
        so_luong
    )
VALUES (1, 1, 'Body', 'dang_ban', 38990000, 'Đen', 5),
    (
        2,
        1,
        'Kit 24-105mm',
        'dang_ban',
        45990000,
        'Đen',
        3
    ),
    (3, 2, 'Body', 'dang_ban', 27990000, 'Đen', 8),
    (4, 3, 'Body', 'dang_ban', 59990000, 'Đen', 2),
    (5, 4, 'Body', 'dang_ban', 18990000, 'Bạc', 6),
    (
        6,
        5,
        'Adventure Kit',
        'dang_ban',
        11990000,
        'Đen',
        15
    ),
    (
        7,
        6,
        'Black Paint',
        'dang_ban',
        199990000,
        'Đen',
        1
    ),
    (
        8,
        7,
        'Fly More Combo',
        'dang_ban',
        42990000,
        'Xám',
        4
    ),
    (
        9,
        8,
        'Adventure Pack',
        'dang_ban',
        10990000,
        'Đen',
        10
    ),
    (
        10,
        9,
        'Kit 12-40mm',
        'dang_ban',
        23990000,
        'Đen',
        7
    );
-- 6. HINH_ANH_SAN_PHAM
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
        'https://example.com/canon_r5_1.jpg',
        'canon_r5_1',
        'Canon EOS R5 Body',
        1,
        1
    ),
    (
        2,
        1,
        'https://example.com/canon_r5_2.jpg',
        'canon_r5_2',
        'Canon EOS R5 Góc nghiêng',
        2,
        0
    ),
    (
        3,
        2,
        'https://example.com/canon_kit_1.jpg',
        'canon_kit_1',
        'Canon EOS R5 Kit',
        1,
        1
    ),
    (
        4,
        3,
        'https://example.com/sony_a7iv_1.jpg',
        'sony_a7iv_1',
        'Sony A7 IV Body',
        1,
        1
    ),
    (
        5,
        4,
        'https://example.com/nikon_z9_1.jpg',
        'nikon_z9_1',
        'Nikon Z9 Body',
        1,
        1
    ),
    (
        6,
        5,
        'https://example.com/fuji_xt5_1.jpg',
        'fuji_xt5_1',
        'Fujifilm X-T5 Body',
        1,
        1
    ),
    (
        7,
        6,
        'https://example.com/gopro12_1.jpg',
        'gopro12_1',
        'GoPro Hero 12',
        1,
        1
    ),
    (
        8,
        7,
        'https://example.com/leica_m11_1.jpg',
        'leica_m11_1',
        'Leica M11 Black Paint',
        1,
        1
    ),
    (
        9,
        8,
        'https://example.com/dji_mavic3_1.jpg',
        'dji_mavic3_1',
        'DJI Mavic 3 Combo',
        1,
        1
    ),
    (
        10,
        9,
        'https://example.com/insta360_x3_1.jpg',
        'insta360_x3_1',
        'Insta360 X3 Adventure',
        1,
        1
    );
-- 7. NGUOI_DUNG
INSERT INTO nguoi_dung (
        id,
        ma_nguoi_dung,
        ho_ten,
        so_dien_thoai,
        email,
        mat_khau_hash,
        vai_tro,
        trang_thai
    )
VALUES (
        1,
        'KH001',
        'Nguyễn Văn An',
        '0912345678',
        'an.nguyen@email.com',
        'hashed_password_1',
        'khach_hang',
        'kich_hoat'
    ),
    (
        2,
        'KH002',
        'Trần Thị Bình',
        '0923456789',
        'binh.tran@email.com',
        'hashed_password_2',
        'khach_hang',
        'kich_hoat'
    ),
    (
        3,
        'KH003',
        'Lê Văn Cường',
        '0934567890',
        'cuong.le@email.com',
        'hashed_password_3',
        'khach_hang',
        'kich_hoat'
    ),
    (
        4,
        'KH004',
        'Phạm Thị Dung',
        '0945678901',
        'dung.pham@email.com',
        'hashed_password_4',
        'khach_hang',
        'kich_hoat'
    ),
    (
        5,
        'KH005',
        'Hoàng Văn Đức',
        '0956789012',
        'duc.hoang@email.com',
        'hashed_password_5',
        'khach_hang',
        'kich_hoat'
    ),
    (
        6,
        'KH006',
        'Vũ Thị Em',
        '0967890123',
        'em.vu@email.com',
        'hashed_password_6',
        'khach_hang',
        'kich_hoat'
    ),
    (
        7,
        'KH007',
        'Đặng Văn Phong',
        '0978901234',
        'phong.dang@email.com',
        'hashed_password_7',
        'khach_hang',
        'kich_hoat'
    ),
    (
        8,
        'KH008',
        'Bùi Thị Quỳnh',
        '0989012345',
        'quynh.bui@email.com',
        'hashed_password_8',
        'khach_hang',
        'kich_hoat'
    ),
    (
        9,
        'AD001',
        'Admin System',
        '0990123456',
        'admin@email.com',
        'hashed_admin_1',
        'quan_tri_vien',
        'kich_hoat'
    ),
    (
        10,
        'AD002',
        'Moderator',
        '0991234567',
        'mod@email.com',
        'hashed_admin_2',
        'quan_tri_vien',
        'kich_hoat'
    );
-- 8. DIA_CHI
INSERT INTO dia_chi (
        id,
        nguoi_dung_id,
        ten_nguoi_nhan,
        so_dien_thoai,
        phuong_xa,
        tinh_thanh,
        dia_chi_cu_the,
        la_mac_dinh
    )
VALUES (
        1,
        1,
        'Nguyễn Văn An',
        '0912345678',
        'Phường 1',
        'TP.HCM',
        '123 Đường ABC',
        1
    ),
    (
        2,
        2,
        'Trần Thị Bình',
        '0923456789',
        'Phường 2',
        'Hà Nội',
        '456 Đường XYZ',
        1
    ),
    (
        3,
        3,
        'Lê Văn Cường',
        '0934567890',
        'Phường 3',
        'Đà Nẵng',
        '789 Đường KLM',
        1
    ),
    (
        4,
        4,
        'Phạm Thị Dung',
        '0945678901',
        'Phường 4',
        'Cần Thơ',
        '321 Đường DEF',
        1
    ),
    (
        5,
        5,
        'Hoàng Văn Đức',
        '0956789012',
        'Phường 5',
        'Hải Phòng',
        '654 Đường GHI',
        1
    ),
    (
        6,
        6,
        'Vũ Thị Em',
        '0967890123',
        'Phường 6',
        'Nha Trang',
        '987 Đường NOP',
        1
    ),
    (
        7,
        7,
        'Đặng Văn Phong',
        '0978901234',
        'Phường 7',
        'Huế',
        '147 Đường QRS',
        1
    ),
    (
        8,
        8,
        'Bùi Thị Quỳnh',
        '0989012345',
        'Phường 8',
        'Vũng Tàu',
        '258 Đường TUV',
        1
    ),
    (
        9,
        9,
        'Admin System',
        '0990123456',
        'Phường 9',
        'TP.HCM',
        '369 Đường WXY',
        1
    ),
    (
        10,
        10,
        'Moderator',
        '0991234567',
        'Phường 10',
        'Hà Nội',
        '159 Đường ZZZ',
        1
    );
-- 9. GIO_HANG
INSERT INTO gio_hang (id, nguoi_dung_id)
VALUES (1, 1),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 5),
    (6, 6),
    (7, 7),
    (8, 8),
    (9, 9),
    (10, 10);
-- 10. CHI_TIET_GIO_HANG
INSERT INTO chi_tiet_gio_hang (id, gio_hang_id, bien_the_san_pham_id, so_luong)
VALUES (1, 1, 1, 1),
    (2, 1, 3, 2),
    (3, 2, 5, 1),
    (4, 3, 7, 1),
    (5, 4, 2, 1),
    (6, 5, 4, 1),
    (7, 6, 6, 2),
    (8, 7, 8, 1),
    (9, 8, 9, 3),
    (10, 9, 10, 1);
-- 11. DON_HANG
INSERT INTO don_hang (
        id,
        ma_don_hang,
        nguoi_dung_id,
        dia_chi_id,
        ten_nguoi_nhan,
        so_dien_thoai_nguoi_nhan,
        dia_chi_giao,
        trang_thai,
        phi_van_chuyen
    )
VALUES (
        1,
        'DH001',
        1,
        1,
        'Nguyễn Văn An',
        '0912345678',
        '123 Đường ABC, Phường 1, TP.HCM',
        'hoan_thanh',
        25000
    ),
    (
        2,
        'DH002',
        2,
        2,
        'Trần Thị Bình',
        '0923456789',
        '456 Đường XYZ, Phường 2, Hà Nội',
        'dang_giao_hang',
        30000
    ),
    (
        3,
        'DH003',
        3,
        3,
        'Lê Văn Cường',
        '0934567890',
        '789 Đường KLM, Phường 3, Đà Nẵng',
        'da_xac_nhan',
        20000
    ),
    (
        4,
        'DH004',
        4,
        4,
        'Phạm Thị Dung',
        '0945678901',
        '321 Đường DEF, Phường 4, Cần Thơ',
        'cho_xac_nhan',
        35000
    ),
    (
        5,
        'DH005',
        5,
        5,
        'Hoàng Văn Đức',
        '0956789012',
        '654 Đường GHI, Phường 5, Hải Phòng',
        'hoan_thanh',
        28000
    ),
    (
        6,
        'DH006',
        6,
        6,
        'Vũ Thị Em',
        '0967890123',
        '987 Đường NOP, Phường 6, Nha Trang',
        'da_huy',
        22000
    ),
    (
        7,
        'DH007',
        7,
        7,
        'Đặng Văn Phong',
        '0978901234',
        '147 Đường QRS, Phường 7, Huế',
        'yeu_cau_tra_hang',
        32000
    ),
    (
        8,
        'DH008',
        8,
        8,
        'Bùi Thị Quỳnh',
        '0989012345',
        '258 Đường TUV, Phường 8, Vũng Tàu',
        'hoan_thanh',
        27000
    ),
    (
        9,
        'DH009',
        9,
        9,
        'Admin System',
        '0990123456',
        '369 Đường WXY, Phường 9, TP.HCM',
        'da_tra_hang',
        24000
    ),
    (
        10,
        'DH010',
        10,
        10,
        'Moderator',
        '0991234567',
        '159 Đường ZZZ, Phường 10, Hà Nội',
        'dang_giao_hang',
        31000
    );
-- 12. CHI_TIET_DON_HANG
INSERT INTO chi_tiet_don_hang (
        id,
        don_hang_id,
        bien_the_san_pham_id,
        ten_san_pham_luc_mua,
        ten_bien_the_luc_mua,
        don_gia_luc_mua,
        so_luong
    )
VALUES (1, 1, 1, 'Canon EOS R5', 'Body', 38990000, 1),
    (2, 1, 3, 'Sony A7 IV', 'Body', 27990000, 1),
    (3, 2, 5, 'Fujifilm X-T5', 'Body', 18990000, 1),
    (
        4,
        3,
        7,
        'Leica M11',
        'Black Paint',
        199990000,
        1
    ),
    (
        5,
        4,
        2,
        'Canon EOS R5',
        'Kit 24-105mm',
        45990000,
        1
    ),
    (6, 5, 4, 'Nikon Z9', 'Body', 59990000, 1),
    (
        7,
        6,
        6,
        'GoPro Hero 12',
        'Adventure Kit',
        11990000,
        2
    ),
    (
        8,
        7,
        8,
        'DJI Mavic 3',
        'Fly More Combo',
        42990000,
        1
    ),
    (
        9,
        8,
        9,
        'Insta360 X3',
        'Adventure Pack',
        10990000,
        1
    ),
    (
        10,
        9,
        10,
        'Olympus OM-1',
        'Kit 12-40mm',
        23990000,
        1
    );
-- 13. THANH_TOAN
INSERT INTO thanh_toan (
        id,
        don_hang_id,
        so_tien,
        phuong_thuc,
        trang_thai,
        ma_giao_dich_ben_thu_3
    )
VALUES (
        1,
        1,
        39015000,
        'vnpay_qr',
        'da_thanh_toan',
        'VNP001'
    ),
    (2, 2, 19020000, 'cod', 'cho_thanh_toan', NULL),
    (
        3,
        3,
        200010000,
        'vnpay_ewallet',
        'da_thanh_toan',
        'VNP002'
    ),
    (4, 4, 46025000, 'cod', 'cho_thanh_toan', NULL),
    (
        5,
        5,
        60018000,
        'vnpay_qr',
        'da_thanh_toan',
        'VNP003'
    ),
    (6, 6, 24012000, 'cod', 'that_bai', NULL),
    (
        7,
        7,
        43022000,
        'vnpay_ewallet',
        'da_hoan_tien',
        'VNP004'
    ),
    (8, 8, 11017000, 'cod', 'da_thanh_toan', NULL),
    (
        9,
        9,
        24014000,
        'vnpay_qr',
        'da_hoan_tien',
        'VNP005'
    ),
    (
        10,
        10,
        24014000,
        'vnpay_ewallet',
        'da_thanh_toan',
        'VNP006'
    );
-- 14. PHIEU_THU
INSERT INTO phieu_thu (
        id,
        nguoi_nhap_id,
        ma_phieu_thu,
        ten_nha_cung_cap,
        ngay_thu
    )
VALUES (1, 9, 'PT001', 'Công ty Máy ảnh ABC', NOW()),
    (2, 9, 'PT002', 'Công ty Thiết bị Số XYZ', NOW()),
    (3, 10, 'PT003', 'Công ty Nhiếp ảnh DEF', NOW()),
    (
        4,
        9,
        'PT004',
        'Công ty Thiết bị Creative',
        NOW()
    ),
    (5, 10, 'PT005', 'Công ty Drone Việt Nam', NOW()),
    (6, 9, 'PT006', 'Công ty Phân phối GHI', NOW()),
    (
        7,
        10,
        'PT007',
        'Công ty Thiết bị Quốc tế',
        NOW()
    ),
    (8, 9, 'PT008', 'Công ty Máy ảnh Châu Á', NOW()),
    (
        9,
        10,
        'PT009',
        'Công ty JKL Distribution',
        NOW()
    ),
    (
        10,
        9,
        'PT010',
        'Công ty Thiết bị Sáng tạo',
        NOW()
    );
-- 15. CHI_TIET_PHIEU_THU
INSERT INTO phieu_thu_chi_tiet (
        id,
        phieu_thu_id,
        bien_the_san_pham_id,
        so_luong,
        gia_nhap_tung_vat
    )
VALUES (1, 1, 1, 5, 35000000),
    (2, 1, 2, 3, 41000000),
    (3, 2, 3, 8, 25000000),
    (4, 3, 4, 2, 55000000),
    (5, 4, 5, 6, 17000000),
    (6, 5, 6, 15, 10000000),
    (7, 6, 7, 1, 180000000),
    (8, 7, 8, 4, 38000000),
    (9, 8, 9, 10, 9000000),
    (10, 9, 10, 7, 21000000);
-- 16. DANH_GIA
INSERT INTO danh_gia (
        id,
        chi_tiet_don_hang_id,
        san_pham_id,
        nguoi_dung_id,
        diem_danh_gia,
        binh_luan,
        trang_thai
    )
VALUES (
        1,
        1,
        1,
        1,
        5,
        'Máy chụp tuyệt vời, chất lượng ảnh xuất sắc',
        'da_duyet'
    ),
    (
        2,
        2,
        2,
        1,
        4,
        'Tốt nhưng pin hơi nhanh hết',
        'da_duyet'
    ),
    (
        3,
        3,
        4,
        2,
        5,
        'Màu sắc Fuji đẹp khỏi bàn',
        'da_duyet'
    ),
    (
        4,
        4,
        6,
        3,
        5,
        'Leica - đẳng cấp khác biệt',
        'da_duyet'
    ),
    (
        5,
        5,
        1,
        4,
        4,
        'Kit lens chất lượng tốt',
        'da_duyet'
    ),
    (
        6,
        6,
        3,
        5,
        5,
        'Z9 - quái thú thực sự',
        'da_duyet'
    ),
    (
        7,
        7,
        5,
        6,
        4,
        'Quay phim ổn định tốt',
        'da_duyet'
    ),
    (
        8,
        8,
        7,
        7,
        3,
        'Hình ảnh đẹp nhưng giá hơi cao',
        'bi_tu_choi'
    ),
    (
        9,
        9,
        8,
        8,
        5,
        'Quay 360 độ cực đỉnh',
        'da_duyet'
    ),
    (
        10,
        10,
        9,
        9,
        4,
        'Ổn định hình ảnh tốt',
        'da_duyet'
    );