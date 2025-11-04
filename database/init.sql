-- 1. Chèn dữ liệu cho bảng cap_do
INSERT INTO cap_do (ma_cap_do, ten_cap_do)
VALUES ('CD001', 'Cơ bản'),
    ('CD002', 'Trung cấp'),
    ('CD003', 'Bán chuyên'),
    ('CD004', 'Chuyên nghiệp'),
    ('CD005', 'Cao cấp');
-- 2. Chèn dữ liệu cho bảng danh_muc
INSERT INTO danh_muc (ma_danh_muc, ten_danh_muc)
VALUES ('DM001', 'Máy ảnh DSLR'),
    ('DM002', 'Máy ảnh Mirrorless'),
    ('DM003', 'Máy ảnh Compact'),
    ('DM004', 'Ống kính'),
    ('DM005', 'Phụ kiện');
-- 3. Chèn dữ liệu cho bảng thuong_hieu
INSERT INTO thuong_hieu (
        ma_thuong_hieu,
        ten_thuong_hieu,
        logo_url,
        public_id
    )
VALUES (
        'TH001',
        'Canon',
        'https://example.com/canon.jpg',
        'canon_logo_123'
    ),
    (
        'TH002',
        'Nikon',
        'https://example.com/nikon.jpg',
        'nikon_logo_456'
    ),
    (
        'TH003',
        'Sony',
        'https://example.com/sony.jpg',
        'sony_logo_789'
    ),
    (
        'TH004',
        'Fujifilm',
        'https://example.com/fujifilm.jpg',
        'fuji_logo_101'
    ),
    (
        'TH005',
        'Olympus',
        'https://example.com/olympus.jpg',
        'olympus_logo_112'
    );
-- 4. Chèn dữ liệu cho bảng nguoi_dung
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
        'KHACH_HANG',
        'KICH_HOAT'
    ),
    (
        'KH002',
        'Trần Thị Bình',
        '0923456789',
        'binh.tran@email.com',
        'hashed_password_2',
        'KHACH_HANG',
        'KICH_HOAT'
    ),
    (
        'KH003',
        'Lê Văn Cường',
        '0934567890',
        'cuong.le@email.com',
        'hashed_password_3',
        'KHACH_HANG',
        'KICH_HOAT'
    ),
    (
        'KH004',
        'Phạm Thị Dung',
        '0945678901',
        'dung.pham@email.com',
        'hashed_password_4',
        'KHACH_HANG',
        'KICH_HOAT'
    ),
    (
        'AD001',
        'Admin System',
        '0956789012',
        'admin@email.com',
        'hashed_password_admin',
        'QUAN_TRI_VIEN',
        'KICH_HOAT'
    );
-- 5. Chèn dữ liệu cho bảng san_pham
INSERT INTO san_pham (
        ma_san_pham,
        danh_muc_id,
        thuong_hieu_id,
        cap_do_id,
        ten_san_pham,
        mau_sac,
        mo_ta,
        thong_so_ky_thuat
    )
VALUES (
        'SP001',
        1,
        1,
        1,
        'Máy ảnh Canon EOS 2000D',
        'Đen',
        'Máy ảnh DSLR cho người mới bắt đầu',
        '{"cảm biến": "APS-C", "độ phân giải": "24.1 MP"}'
    ),
    (
        'SP002',
        2,
        3,
        2,
        'Máy ảnh Sony A6000',
        'Đen',
        'Máy ảnh mirrorless nhỏ gọn, tốc độ chụp nhanh',
        '{"cảm biến": "APS-C", "độ phân giải": "24.3 MP"}'
    ),
    (
        'SP003',
        1,
        2,
        3,
        'Máy ảnh Nikon D7500',
        'Đen',
        'Máy ảnh DSLR bán chuyên',
        '{"cảm biến": "APS-C", "độ phân giải": "20.9 MP"}'
    ),
    (
        'SP004',
        4,
        1,
        4,
        'Ống kính Canon EF 50mm f/1.8 STM',
        'Đen',
        'Ống kính prime tiêu chuẩn, khẩu độ lớn',
        '{"tiêu cự": "50mm", "khẩu độ": "f/1.8"}'
    ),
    (
        'SP005',
        5,
        5,
        1,
        'Tripod Olympus',
        'Bạc',
        'Chân máy ảnh chắc chắn',
        '{"chất liệu": "Nhôm", "chiều cao": "1.5m"}'
    );
-- 6. Chèn dữ liệu cho bảng bien_the_san_pham
INSERT INTO bien_the_san_pham (
        san_pham_id,
        ten_bien_the,
        trang_thai_kich_hoat,
        gia_ban,
        mau,
        so_luong
    )
VALUES (
        1,
        'Canon EOS 2000D Body',
        'DANG_BAN',
        8990000,
        'Đen',
        10
    ),
    (
        1,
        'Canon EOS 2000D Kit 18-55mm',
        'DANG_BAN',
        12990000,
        'Đen',
        5
    ),
    (
        2,
        'Sony A6000 Body',
        'DANG_BAN',
        11990000,
        'Đen',
        8
    ),
    (
        3,
        'Nikon D7500 Body',
        'DANG_BAN',
        18990000,
        'Đen',
        3
    ),
    (
        4,
        'Canon EF 50mm f/1.8 STM',
        'DANG_BAN',
        2500000,
        'Đen',
        20
    ),
    (
        5,
        'Tripod Olympus 1.5m',
        'DANG_BAN',
        800000,
        'Bạc',
        15
    );
-- 7. Chèn dữ liệu cho bảng hinh_anh_san_pham
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
        'https://example.com/canon_eos_2000d_1.jpg',
        'canon_2000d_1',
        'Canon EOS 2000D Body',
        1,
        TRUE
    ),
    (
        1,
        'https://example.com/canon_eos_2000d_2.jpg',
        'canon_2000d_2',
        'Canon EOS 2000D Body góc khác',
        2,
        FALSE
    ),
    (
        2,
        'https://example.com/canon_kit_1.jpg',
        'canon_kit_1',
        'Canon EOS 2000D Kit',
        1,
        TRUE
    ),
    (
        3,
        'https://example.com/sony_a6000_1.jpg',
        'sony_a6000_1',
        'Sony A6000 Body',
        1,
        TRUE
    ),
    (
        4,
        'https://example.com/nikon_d7500_1.jpg',
        'nikon_d7500_1',
        'Nikon D7500 Body',
        1,
        TRUE
    ),
    (
        5,
        'https://example.com/canon_50mm_1.jpg',
        'canon_50mm_1',
        'Canon EF 50mm f/1.8 STM',
        1,
        TRUE
    ),
    (
        6,
        'https://example.com/tripod_olympus_1.jpg',
        'tripod_olympus_1',
        'Tripod Olympus',
        1,
        TRUE
    );
-- 8. Chèn dữ liệu cho bảng dia_chi
INSERT INTO dia_chi (
        nguoi_dung_id,
        ten_nguoi_nhan,
        so_dien_thoai,
        phuong_xa,
        tinh_thanh,
        dia_chi_cu_the,
        ma_buu_dien,
        la_mac_dinh
    )
VALUES (
        1,
        'Nguyễn Văn An',
        '0912345678',
        'Phường 1',
        'Quận 1',
        '123 Đường ABC',
        '700000',
        TRUE
    ),
    (
        1,
        'Nguyễn Văn An',
        '0912345678',
        'Phường 2',
        'Quận 2',
        '456 Đường DEF',
        '700000',
        FALSE
    ),
    (
        2,
        'Trần Thị Bình',
        '0923456789',
        'Phường 3',
        'Quận 3',
        '789 Đường GHI',
        '700000',
        TRUE
    ),
    (
        3,
        'Lê Văn Cường',
        '0934567890',
        'Phường 4',
        'Quận 4',
        '321 Đường JKL',
        '700000',
        TRUE
    ),
    (
        4,
        'Phạm Thị Dung',
        '0945678901',
        'Phường 5',
        'Quận 5',
        '654 Đường MNO',
        '700000',
        TRUE
    );
-- 9. Chèn dữ liệu cho bảng gio_hang
INSERT INTO gio_hang (nguoi_dung_id)
VALUES (1),
    (2),
    (3),
    (4);
-- 10. Chèn dữ liệu cho bảng chi_tiet_gio_hang
INSERT INTO chi_tiet_gio_hang (gio_hang_id, bien_the_san_pham_id, so_luong)
VALUES (1, 1, 1),
    (1, 5, 2),
    (2, 3, 1),
    (3, 2, 1),
    (4, 4, 1);
-- 11. Chèn dữ liệu cho bảng don_hang
INSERT INTO don_hang (
        ma_don_hang,
        nguoi_dung_id,
        dia_chi_id,
        ten_nguoi_nhan,
        so_dien_thoai_nguoi_nhan,
        dia_chi_giao,
        trang_thai,
        phi_van_chuyen,
        ghi_chu
    )
VALUES (
        'DH001',
        1,
        1,
        'Nguyễn Văn An',
        '0912345678',
        '123 Đường ABC, Phường 1, Quận 1',
        'CHO_XAC_NHAN',
        30000,
        'Giao giờ hành chính'
    ),
    (
        'DH002',
        2,
        3,
        'Trần Thị Bình',
        '0923456789',
        '789 Đường GHI, Phường 3, Quận 3',
        'DANG_GIAO',
        30000,
        NULL
    ),
    (
        'DH003',
        3,
        4,
        'Lê Văn Cường',
        '0934567890',
        '321 Đường JKL, Phường 4, Quận 4',
        'DA_GIAO',
        30000,
        'Giao nhanh'
    ),
    (
        'DH004',
        1,
        2,
        'Nguyễn Văn An',
        '0912345678',
        '456 Đường DEF, Phường 2, Quận 2',
        'DA_HUY',
        0,
        'Khách hủy'
    ),
    (
        'DH005',
        4,
        5,
        'Phạm Thị Dung',
        '0945678901',
        '654 Đường MNO, Phường 5, Quận 5',
        'DA_GIAO',
        30000,
        NULL
    );
-- 12. Chèn dữ liệu cho bảng chi_tiet_don_hang
INSERT INTO chi_tiet_don_hang (
        don_hang_id,
        bien_the_san_pham_id,
        ten_san_pham_luc_mua,
        ten_bien_the_luc_mua,
        don_gia_luc_mua,
        so_luong
    )
VALUES (
        1,
        1,
        'Máy ảnh Canon EOS 2000D',
        'Canon EOS 2000D Body',
        8990000,
        1
    ),
    (
        1,
        5,
        'Ống kính Canon EF 50mm f/1.8 STM',
        'Canon EF 50mm f/1.8 STM',
        2500000,
        1
    ),
    (
        2,
        3,
        'Máy ảnh Sony A6000',
        'Sony A6000 Body',
        11990000,
        1
    ),
    (
        3,
        2,
        'Máy ảnh Canon EOS 2000D',
        'Canon EOS 2000D Kit 18-55mm',
        12990000,
        1
    ),
    (
        4,
        4,
        'Máy ảnh Nikon D7500',
        'Nikon D7500 Body',
        18990000,
        1
    ),
    (
        5,
        6,
        'Tripod Olympus',
        'Tripod Olympus 1.5m',
        800000,
        1
    );
-- 13. Chèn dữ liệu cho bảng thanh_toan
INSERT INTO thanh_toan (
        don_hang_id,
        so_tien,
        phuong_thuc,
        trang_thai,
        ma_giao_dich_ben_thu_3
    )
VALUES (1, 11520000, 'COD', 'CHO_THANH_TOAN', NULL),
    (
        2,
        12020000,
        'CHUYEN_KHOAN',
        'DA_THANH_TOAN',
        'TX123456789'
    ),
    (3, 13020000, 'COD', 'DA_THANH_TOAN', NULL),
    (4, 18990000, 'COD', 'DA_HUY', NULL),
    (5, 830000, 'COD', 'DA_THANH_TOAN', NULL);
-- 14. Chèn dữ liệu cho bảng danh_gia
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
        'Sản phẩm tốt, đúng như mô tả',
        'DA_DUYET'
    ),
    (
        2,
        4,
        1,
        4,
        'Ống kính sắc nét, giá hợp lý',
        'DA_DUYET'
    ),
    (
        3,
        2,
        2,
        5,
        'Máy ảnh Sony rất đẹp và nhỏ gọn',
        'DA_DUYET'
    ),
    (
        5,
        3,
        3,
        4,
        'Máy ảnh Nikon chụp ảnh rất đẹp',
        'DA_DUYET'
    ),
    (
        6,
        5,
        4,
        5,
        'Tripod chắc chắn, giá rẻ',
        'DA_DUYET'
    );
-- 15. Chèn dữ liệu cho bảng phieu_thu
INSERT INTO phieu_thu (
        nguoi_nhap_id,
        ma_phieu_thu,
        ten_nha_cung_cap,
        ngay_thu
    )
VALUES (
        5,
        'PT001',
        'Công ty TNHH Máy ảnh ABC',
        '2024-01-15 10:00:00'
    ),
    (
        5,
        'PT002',
        'Công ty CPTM Máy ảnh XYZ',
        '2024-01-16 14:30:00'
    ),
    (
        5,
        'PT003',
        'Công ty TNHH Thiết bị số DEF',
        '2024-01-17 09:15:00'
    ),
    (
        5,
        'PT004',
        'Công ty TNHH Phụ kiện máy ảnh',
        '2024-01-18 16:45:00'
    ),
    (
        5,
        'PT005',
        'Công ty TNHH Máy ảnh Quốc tế',
        '2024-01-19 11:20:00'
    );
-- 16. Chèn dữ liệu cho bảng chi_tiet_phieu_thu
INSERT INTO chi_tiet_phieu_thu (
        phieu_thu_id,
        bien_the_san_pham_id,
        so_luong,
        gia_nhap_tung_vat
    )
VALUES (1, 1, 5, 7000000),
    (1, 2, 3, 10000000),
    (2, 3, 4, 9000000),
    (3, 4, 2, 15000000),
    (4, 5, 10, 1800000),
    (5, 6, 8, 500000);