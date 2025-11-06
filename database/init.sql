use myshop;
-- 1. DANH_MUC
INSERT INTO danh_muc (ma_danh_muc, ten_danh_muc)
VALUES ('DM001', 'Máy ảnh DSLR'),
    ('DM002', 'Máy ảnh Mirrorless'),
    ('DM003', 'Ống kính'),
    ('DM004', 'Máy ảnh Compact'),
    ('DM005', 'Thiết bị quay phim'),
    ('DM006', 'Đèn Flash'),
    ('DM007', 'Tripod'),
    ('DM008', 'Balô & Túi đựng'),
    ('DM009', 'Phụ kiện'),
    ('DM010', 'Drone');
-- 2. THUONG_HIEU
INSERT INTO thuong_hieu (ma_thuong_hieu, ten_thuong_hieu)
VALUES ('TH001', 'Canon'),
    ('TH002', 'Nikon'),
    ('TH003', 'Sony'),
    ('TH004', 'Fujifilm'),
    ('TH005', 'Panasonic'),
    ('TH006', 'Olympus'),
    ('TH007', 'GoPro'),
    ('TH008', 'DJI'),
    ('TH009', 'Sigma'),
    ('TH010', 'Tamron');
-- 3. CAP_DO
INSERT INTO cap_do (ma_cap_do, ten_cap_do)
VALUES ('CD001', 'Mới bắt đầu'),
    ('CD002', 'Nghiệp dư'),
    ('CD003', 'Bán chuyên'),
    ('CD004', 'Chuyên nghiệp'),
    ('CD005', 'Cao cấp'),
    ('CD006', 'Nhà nhiếp ảnh'),
    ('CD007', 'Studio'),
    ('CD008', 'Quay phim'),
    ('CD009', 'Du lịch'),
    ('CD010', 'Thiên nhiên');
-- 4. SAN_PHAM
INSERT INTO san_pham (
        ma_san_pham,
        danh_muc_id,
        thuong_hieu_id,
        cap_do_id,
        ten_san_pham,
        mo_ta,
        thong_so_ky_thuat
    )
VALUES (
        'SP001',
        1,
        1,
        4,
        'Canon EOS R5',
        'Máy ảnh mirrorless chuyên nghiệp',
        '{"Cảm biến":"Full-frame 45MP", "ISO":"100-51200"}'
    ),
    (
        'SP002',
        1,
        2,
        4,
        'Nikon Z9',
        'Flagship mirrorless cho nhiếp ảnh thể thao',
        '{"Cảm biến":"Stacked CMOS 45.7MP", "Tốc độ chụp":"20 fps"}'
    ),
    (
        'SP003',
        2,
        3,
        3,
        'Sony A7 III',
        'Máy ảnh full-frame đa năng',
        '{"Cảm biến":"24.2MP", "Ổn định hình ảnh":"5 trục"}'
    ),
    (
        'SP004',
        3,
        1,
        4,
        'Canon RF 24-70mm f/2.8',
        'Ống kính zoom tiêu chuẩn chuyên nghiệp',
        '{"Khẩu độ":"f/2.8", "Tiêu cự":"24-70mm"}'
    ),
    (
        'SP005',
        3,
        9,
        4,
        'Sigma 85mm f/1.4',
        'Ống kính chân dung cao cấp',
        '{"Khẩu độ":"f/1.4", "Trọng lượng":"1130g"}'
    ),
    (
        'SP006',
        4,
        7,
        2,
        'GoPro Hero 11',
        'Máy quay hành động 4K',
        '{"Độ phân giải":"4K", "Chống nước":"10m"}'
    ),
    (
        'SP007',
        5,
        8,
        4,
        'DJI Ronin-S',
        'Gimbal stabilizer chuyên nghiệp',
        '{"Tải trọng":"3.6kg", "Pin":"12 giờ"}'
    ),
    (
        'SP008',
        6,
        1,
        3,
        'Canon Speedlite 600EX',
        'Đèn flash tốc độ cao',
        '{"GN":"60m", "Xoay":"360 độ"}'
    ),
    (
        'SP009',
        7,
        6,
        2,
        'Manfrotto 190X',
        'Tripod nhôm chắc chắn',
        '{"Chiều cao":"150cm", "Trọng lượng":"2.1kg"}'
    ),
    (
        'SP010',
        8,
        5,
        1,
        'Lowepro ProTactic 450',
        'Ba lô máy ảnh đa năng',
        '{"Kích thước":"30x45x25cm", "Ngăn chứa":"15"}'
    );
-- 5. BIEN_THE_SAN_PHAM
INSERT INTO bien_the_san_pham (
        san_pham_id,
        ten_bien_the,
        trang_thai_kich_hoat,
        gia_ban,
        mau,
        so_luong
    )
VALUES (1, 'Body Only', 'dang_ban', 38990000, 'Đen', 5),
    (
        1,
        'Kit 24-105mm',
        'dang_ban',
        45990000,
        'Đen',
        3
    ),
    (2, 'Body Only', 'dang_ban', 42990000, 'Đen', 4),
    (3, 'Body Only', 'dang_ban', 23990000, 'Đen', 8),
    (4, 'RF 24-70mm', 'dang_ban', 25990000, 'Đen', 6),
    (5, 'Sigma 85mm', 'dang_ban', 15990000, 'Bạc', 7),
    (
        6,
        'GoPro Hero 11',
        'dang_ban',
        8990000,
        'Đen',
        15
    ),
    (7, 'DJI Ronin-S', 'dang_ban', 11990000, 'Đen', 4),
    (
        8,
        'Speedlite 600EX',
        'dang_ban',
        7990000,
        'Đen',
        10
    ),
    (
        9,
        'Manfrotto 190X',
        'dang_ban',
        4590000,
        'Đen',
        12
    );
-- 6. HINH_ANH_SAN_PHAM
INSERT INTO hinh_anh_san_pham (
        bien_the_id,
        url,
        public_id,
        alt_text,
        thu_tu,
        la_anh_dai_dien
    )
VALUES (
        1,
        'https://example.com/canon-r5-1.jpg',
        'canon_r5_1',
        'Canon EOS R5 Body',
        1,
        true
    ),
    (
        1,
        'https://example.com/canon-r5-2.jpg',
        'canon_r5_2',
        'Canon EOS R5 Góc nghiêng',
        2,
        false
    ),
    (
        2,
        'https://example.com/nikon-z9-1.jpg',
        'nikon_z9_1',
        'Nikon Z9 Body',
        1,
        true
    ),
    (
        3,
        'https://example.com/sony-a7iii-1.jpg',
        'sony_a7iii_1',
        'Sony A7 III Body',
        1,
        true
    ),
    (
        4,
        'https://example.com/canon-24-70.jpg',
        'canon_24_70',
        'Canon RF 24-70mm',
        1,
        true
    ),
    (
        5,
        'https://example.com/sigma-85mm.jpg',
        'sigma_85mm',
        'Sigma 85mm f/1.4',
        1,
        true
    ),
    (
        6,
        'https://example.com/gopro-11.jpg',
        'gopro_11',
        'GoPro Hero 11',
        1,
        true
    ),
    (
        7,
        'https://example.com/dji-ronin.jpg',
        'dji_ronin',
        'DJI Ronin-S',
        1,
        true
    ),
    (
        8,
        'https://example.com/canon-flash.jpg',
        'canon_flash',
        'Canon Speedlite 600EX',
        1,
        true
    ),
    (
        9,
        'https://example.com/manfrotto.jpg',
        'manfrotto',
        'Manfrotto 190X Tripod',
        1,
        true
    );
-- 7. NGUOI_DUNG
INSERT INTO nguoi_dung (
        ma_nguoi_dung,
        ho_ten,
        so_dien_thoai,
        email,
        mat_khau_hash,
        vai_tro,
        trang_thai
    )
VALUES (
        'KH001',
        'Nguyễn Văn An',
        '0912345678',
        'an.nguyen@email.com',
        'hashed_password_1',
        'khach_hang',
        'kich_hoat'
    ),
    (
        'KH002',
        'Trần Thị Bình',
        '0923456789',
        'binh.tran@email.com',
        'hashed_password_2',
        'khach_hang',
        'kich_hoat'
    ),
    (
        'KH003',
        'Lê Văn Cường',
        '0934567890',
        'cuong.le@email.com',
        'hashed_password_3',
        'khach_hang',
        'kich_hoat'
    ),
    (
        'KH004',
        'Phạm Thị Dung',
        '0945678901',
        'dung.pham@email.com',
        'hashed_password_4',
        'khach_hang',
        'kich_hoat'
    ),
    (
        'KH005',
        'Hoàng Văn Em',
        '0956789012',
        'em.hoang@email.com',
        'hashed_password_5',
        'khach_hang',
        'kich_hoat'
    ),
    (
        'KH006',
        'Vũ Thị Phương',
        '0967890123',
        'phuong.vu@email.com',
        'hashed_password_6',
        'khach_hang',
        'kich_hoat'
    ),
    (
        'KH007',
        'Đặng Văn Hải',
        '0978901234',
        'hai.dang@email.com',
        'hashed_password_7',
        'khach_hang',
        'kich_hoat'
    ),
    (
        'KH008',
        'Bùi Thị Lan',
        '0989012345',
        'lan.bui@email.com',
        'hashed_password_8',
        'khach_hang',
        'kich_hoat'
    ),
    (
        'AD001',
        'Admin Quản Trị',
        '0990123456',
        'admin@camerastore.com',
        'hashed_admin_1',
        'quan_tri_vien',
        'kich_hoat'
    ),
    (
        'AD002',
        'Quản Lý Kho',
        '0991234567',
        'kho@camerastore.com',
        'hashed_admin_2',
        'quan_tri_vien',
        'kich_hoat'
    );
-- 8. DIA_CHI
INSERT INTO dia_chi (
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
        'Nguyễn Văn An',
        '0912345678',
        'Phường 1',
        'TP.HCM',
        '123 Đường ABC',
        true
    ),
    (
        2,
        'Trần Thị Bình',
        '0923456789',
        'Phường 2',
        'Hà Nội',
        '456 Đường XYZ',
        true
    ),
    (
        3,
        'Lê Văn Cường',
        '0934567890',
        'Phường 3',
        'Đà Nẵng',
        '789 Đường DEF',
        true
    ),
    (
        4,
        'Phạm Thị Dung',
        '0945678901',
        'Phường 4',
        'Cần Thơ',
        '321 Đường GHI',
        true
    ),
    (
        5,
        'Hoàng Văn Em',
        '0956789012',
        'Phường 5',
        'Hải Phòng',
        '654 Đường JKL',
        true
    ),
    (
        6,
        'Vũ Thị Phương',
        '0967890123',
        'Phường 6',
        'Nha Trang',
        '987 Đường MNO',
        true
    ),
    (
        7,
        'Đặng Văn Hải',
        '0978901234',
        'Phường 7',
        'Huế',
        '147 Đường PQR',
        true
    ),
    (
        8,
        'Bùi Thị Lan',
        '0989012345',
        'Phường 8',
        'Vũng Tàu',
        '258 Đường STU',
        true
    ),
    (
        1,
        'Nguyễn Văn An',
        '0912345678',
        'Phường 9',
        'TP.HCM',
        '456 Đường VWX',
        false
    ),
    (
        2,
        'Trần Thị Bình',
        '0923456789',
        'Phường 10',
        'Hà Nội',
        '789 Đường YZ',
        false
    );
-- 9. GIO_HANG
INSERT INTO gio_hang (nguoi_dung_id)
VALUES (1),
    (2),
    (3),
    (4),
    (5),
    (6),
    (7),
    (8);
-- 10. CHI_TIET_GIO_HANG
INSERT INTO chi_tiet_gio_hang (gio_hang_id, bien_the_san_pham_id, so_luong)
VALUES (1, 1, 1),
    (1, 4, 1),
    (2, 3, 1),
    (3, 5, 2),
    (4, 6, 1),
    (5, 7, 1),
    (6, 8, 1),
    (7, 9, 1),
    (8, 10, 1),
    (2, 2, 1);
-- 11. DON_HANG
INSERT INTO don_hang (
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
        'DH003',
        3,
        3,
        'Lê Văn Cường',
        '0934567890',
        '789 Đường DEF, Phường 3, Đà Nẵng',
        'da_xac_nhan',
        20000
    ),
    (
        'DH004',
        4,
        4,
        'Phạm Thị Dung',
        '0945678901',
        '321 Đường GHI, Phường 4, Cần Thơ',
        'cho_xac_nhan',
        35000
    ),
    (
        'DH005',
        5,
        5,
        'Hoàng Văn Em',
        '0956789012',
        '654 Đường JKL, Phường 5, Hải Phòng',
        'hoan_thanh',
        28000
    ),
    (
        'DH006',
        6,
        6,
        'Vũ Thị Phương',
        '0967890123',
        '987 Đường MNO, Phường 6, Nha Trang',
        'da_huy',
        22000
    ),
    (
        'DH007',
        7,
        7,
        'Đặng Văn Hải',
        '0978901234',
        '147 Đường PQR, Phường 7, Huế',
        'yeu_cau_tra_hang',
        32000
    ),
    (
        'DH008',
        8,
        8,
        'Bùi Thị Lan',
        '0989012345',
        '258 Đường STU, Phường 8, Vũng Tàu',
        'hoan_thanh',
        26000
    ),
    (
        'DH009',
        1,
        9,
        'Nguyễn Văn An',
        '0912345678',
        '456 Đường VWX, Phường 9, TP.HCM',
        'da_xac_nhan',
        24000
    ),
    (
        'DH010',
        2,
        10,
        'Trần Thị Bình',
        '0923456789',
        '789 Đường YZ, Phường 10, Hà Nội',
        'dang_giao_hang',
        31000
    );
-- 12. CHI_TIET_DON_HANG
INSERT INTO chi_tiet_don_hang (
        don_hang_id,
        bien_the_san_pham_id,
        ten_san_pham_luc_mua,
        ten_bien_the_luc_mua,
        don_gia_luc_mua,
        so_luong
    )
VALUES (1, 1, 'Canon EOS R5', 'Body Only', 38990000, 1),
    (
        1,
        4,
        'Canon RF 24-70mm f/2.8',
        'RF 24-70mm',
        25990000,
        1
    ),
    (2, 3, 'Sony A7 III', 'Body Only', 23990000, 1),
    (
        3,
        5,
        'Sigma 85mm f/1.4',
        'Sigma 85mm',
        15990000,
        1
    ),
    (
        4,
        6,
        'GoPro Hero 11',
        'GoPro Hero 11',
        8990000,
        2
    ),
    (5, 7, 'DJI Ronin-S', 'DJI Ronin-S', 11990000, 1),
    (
        6,
        8,
        'Canon Speedlite 600EX',
        'Speedlite 600EX',
        7990000,
        1
    ),
    (
        7,
        9,
        'Manfrotto 190X',
        'Manfrotto 190X',
        4590000,
        1
    ),
    (
        8,
        10,
        'Lowepro ProTactic 450',
        'Lowepro ProTactic 450',
        2890000,
        1
    ),
    (
        9,
        2,
        'Canon EOS R5',
        'Kit 24-105mm',
        45990000,
        1
    );
-- 13. THANH_TOAN
INSERT INTO thanh_toan (
        don_hang_id,
        so_tien,
        phuong_thuc,
        trang_thai,
        ma_giao_dich_ben_thu_3
    )
VALUES (
        1,
        65015000,
        'vnpay_qr',
        'da_thanh_toan',
        'VNPAY123456'
    ),
    (2, 24020000, 'cod', 'cho_thanh_toan', NULL),
    (
        3,
        16010000,
        'vnpay_ewallet',
        'da_thanh_toan',
        'VNPAY789012'
    ),
    (4, 18033000, 'cod', 'cho_thanh_toan', NULL),
    (
        5,
        12018000,
        'vnpay_qr',
        'da_thanh_toan',
        'VNPAY345678'
    ),
    (6, 8012000, 'cod', 'that_bai', NULL),
    (
        7,
        4622000,
        'vnpay_ewallet',
        'da_hoan_tien',
        'VNPAY901234'
    ),
    (8, 2916000, 'cod', 'da_thanh_toan', NULL),
    (
        9,
        46014000,
        'vnpay_qr',
        'da_thanh_toan',
        'VNPAY567890'
    ),
    (10, 24031000, 'cod', 'cho_thanh_toan', NULL);
-- 14. PHIEU_THU
INSERT INTO phieu_thu (nguoi_nhap_id, ma_phieu_thu, ten_nha_cung_cap)
VALUES (9, 'PT001', 'Công ty Máy ảnh ABC'),
    (10, 'PT002', 'Công ty Thiết bị Số XYZ'),
    (9, 'PT003', 'Công ty Nhiếp ảnh DEF'),
    (10, 'PT004', 'Công ty Phụ kiện GHI'),
    (9, 'PT005', 'Công ty Quay phim JKL'),
    (10, 'PT006', 'Công ty Drone MNO'),
    (9, 'PT007', 'Công ty Ống kính PQR'),
    (10, 'PT008', 'Công ty Flash STU'),
    (9, 'PT009', 'Công ty Tripod VWX'),
    (10, 'PT010', 'Công ty Balô YZ');
-- 15. CHI_TIET_PHIEU_THU
INSERT INTO chi_tiet_phieu_thu (
        phieu_thu_id,
        bien_the_san_pham_id,
        so_luong,
        gia_nhap_tung_vat
    )
VALUES (1, 1, 2, 35000000),
    (1, 2, 3, 42000000),
    (2, 3, 5, 21000000),
    (3, 4, 4, 23000000),
    (4, 5, 6, 14000000),
    (5, 6, 10, 7500000),
    (6, 7, 3, 10000000),
    (7, 8, 8, 6500000),
    (8, 9, 7, 3800000),
    (9, 10, 5, 2400000);
-- 16. DANH_GIA
INSERT INTO danh_gia (
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
        5,
        'Máy chụp tuyệt vời, chất lượng hình ảnh sắc nét',
        'da_duyet'
    ),
    (2, 3, 2, 4, 'Máy tốt, giá hợp lý', 'da_duyet'),
    (
        3,
        5,
        3,
        5,
        'Ống kính sắc nét, build quality tốt',
        'da_duyet'
    ),
    (4, 6, 4, 4, 'Quay video 4K rất đẹp', 'da_duyet'),
    (
        5,
        7,
        5,
        3,
        'Gimbal ổn định nhưng hơi nặng',
        'da_duyet'
    ),
    (
        6,
        8,
        6,
        5,
        'Flash mạnh mẽ, recycle time nhanh',
        'da_duyet'
    ),
    (
        7,
        9,
        7,
        4,
        'Tripod chắc chắn, dễ điều chỉnh',
        'da_duyet'
    ),
    (
        8,
        10,
        8,
        5,
        'Ba lô nhiều ngăn, tiện lợi',
        'da_duyet'
    ),
    (
        9,
        2,
        1,
        4,
        'Combo kit tiết kiệm, ống kính linh hoạt',
        'da_duyet'
    ),
    (
        10,
        4,
        2,
        5,
        'Ống kính professional, màu sắc trung thực',
        'da_duyet'
    );