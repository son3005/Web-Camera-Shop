use myshop;
-- 1. Bảng danh_muc (Danh mục sản phẩm)
INSERT INTO danh_muc (id, ma_danh_muc, ten_danh_muc)
VALUES (1, 'CAM', 'Máy Ảnh'),
    (2, 'LENS', 'Ống Kính'),
    (3, 'ACC', 'Phụ Kiện');
-- 2. Bảng thuong_hieu (Thương hiệu)
INSERT INTO thuong_hieu (id, ma_thuong_hieu, ten_thuong_hieu)
VALUES (1, 'CN', 'Canon'),
    (2, 'NK', 'Nikon'),
    (3, 'SN', 'Sony'),
    (4, 'FJ', 'Fujifilm');
-- 3. Bảng cap_do (Cấp độ sản phẩm)
INSERT INTO cap_do (id, ma_cap_do, ten_cap_do)
VALUES (1, 'BGN', 'Beginner'),
    (2, 'ENT', 'Entry-level'),
    (3, 'SEM', 'Semi-pro'),
    (4, 'PRO', 'Professional');
-- 4. Bảng nha_cung_cap (Nhà cung cấp)
INSERT INTO nha_cung_cap (
        id,
        ma_nha_cung_cap,
        ten_nha_cung_cap,
        dia_chi,
        so_dien_thoai,
        email,
        trang_thai
    )
VALUES (
        1,
        'NCC001',
        'Công ty TNHH Camera Việt',
        '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
        '02838456789',
        'contact@cameravn.com',
        'KICH_HOAT'
    ),
    (
        2,
        'NCC002',
        'Nhập khẩu Máy ảnh Á Châu',
        '45 Lê Lợi, Quận 1, TP.HCM',
        '02838234567',
        'info@asiacamera.com',
        'KICH_HOAT'
    );
-- 5. Bảng nguoi_dung (Người dùng - admin và khách hàng)
INSERT INTO nguoi_dung (
        id,
        ma_nguoi_dung,
        ho_ten,
        email,
        mat_khau_hash,
        vai_tro,
        trang_thai
    )
VALUES (
        1,
        'ADMIN001',
        'Nguyễn Văn Quản Trị',
        'admin@camerastore.com',
        SHA2('Admin@123', 256),
        'QUAN_TRI_VIEN',
        'KICH_HOAT'
    ),
    (
        2,
        'KH001',
        'Trần Thị Khách Hàng',
        'customer1@gmail.com',
        SHA2('Customer@123', 256),
        'KHACH_HANG',
        'KICH_HOAT'
    ),
    (
        3,
        'KH002',
        'Lê Văn Nhiếp Ảnh',
        'photographer@email.com',
        SHA2('Photo@123', 256),
        'KHACH_HANG',
        'KICH_HOAT'
    );
-- 6. Bảng san_pham (Sản phẩm máy ảnh)
INSERT INTO san_pham (
        id,
        ma_san_pham,
        danh_muc_id,
        thuong_hieu_id,
        cap_do_id,
        ten_san_pham,
        mo_ta,
        thong_so_ky_thuat
    )
VALUES (
        1,
        'CANON_EOS_R6',
        1,
        1,
        4,
        'Canon EOS R6',
        'Máy ảnh mirrorless full-frame chuyên nghiệp',
        '{"Cảm biến": "20.1MP Full-frame", "ISO": "100-102400", "Tốc độ chụp": "12 fps"}'
    ),
    (
        2,
        'NIKON_Z7II',
        1,
        2,
        4,
        'Nikon Z7 II',
        'Máy ảnh mirrorless full-frame cao cấp',
        '{"Cảm biến": "45.7MP Full-frame", "ISO": "64-25600", "Tốc độ chụp": "10 fps"}'
    ),
    (
        3,
        'SONY_A7III',
        1,
        3,
        3,
        'Sony Alpha A7 III',
        'Máy ảnh mirrorless full-frame bán chuyên',
        '{"Cảm biến": "24.2MP Full-frame", "ISO": "100-51200", "Tốc độ chụp": "10 fps"}'
    ),
    (
        4,
        'CANON_24-70',
        2,
        1,
        4,
        'Canon RF 24-70mm f/2.8L',
        'Ống kính zoom tiêu chuẩn chuyên nghiệp',
        '{"Tiêu cự": "24-70mm", "Khẩu độ": "f/2.8", "Ổn định hình ảnh": "Có"}'
    ),
    (
        5,
        'NIKON_50MM',
        2,
        2,
        2,
        'Nikon NIKKOR Z 50mm f/1.8',
        'Ống kính prime chuẩn full-frame',
        '{"Tiêu cự": "50mm", "Khẩu độ": "f/1.8", "Ổn định hình ảnh": "Không"}'
    );
-- 7. Bảng bien_the_san_pham (Biến thể sản phẩm - màu sắc, số lượng)
INSERT INTO bien_the_san_pham (
        id,
        san_pham_id,
        ten_bien_the,
        trang_thai_kich_hoat,
        gia_ban,
        mau,
        so_luong_nhap,
        so_luong_ban
    )
VALUES (
        1,
        1,
        'Body only',
        'DANG_BAN',
        45990000,
        'Đen',
        20,
        5
    ),
    (
        2,
        1,
        'Kit 24-105mm',
        'DANG_BAN',
        59990000,
        'Đen',
        15,
        8
    ),
    (
        3,
        2,
        'Body only',
        'DANG_BAN',
        61990000,
        'Đen',
        12,
        3
    ),
    (
        4,
        3,
        'Body only',
        'DANG_BAN',
        32990000,
        'Đen',
        30,
        15
    ),
    (
        5,
        4,
        'RF 24-70mm',
        'DANG_BAN',
        42990000,
        'Trắng',
        8,
        2
    ),
    (
        6,
        5,
        'Z 50mm f/1.8',
        'DANG_BAN',
        8990000,
        'Đen',
        25,
        12
    );
-- 8. Bảng hinh_anh_san_pham (Hình ảnh sản phẩm)
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
        'https://res.cloudinary.com/store/image/upload/canon_r6_1.jpg',
        'canon_r6_1',
        'Canon EOS R6 góc trước',
        1,
        TRUE
    ),
    (
        2,
        1,
        'https://res.cloudinary.com/store/image/upload/canon_r6_2.jpg',
        'canon_r6_2',
        'Canon EOS R6 góc sau',
        2,
        FALSE
    ),
    (
        3,
        3,
        'https://res.cloudinary.com/store/image/upload/nikon_z7ii_1.jpg',
        'nikon_z7ii_1',
        'Nikon Z7 II chính hãng',
        1,
        TRUE
    ),
    (
        4,
        6,
        'https://res.cloudinary.com/store/image/upload/nikon_50mm_1.jpg',
        'nikon_50mm_1',
        'Ống kính Nikon 50mm f/1.8',
        1,
        TRUE
    );
-- 9. Bảng dia_chi (Địa chỉ giao hàng)
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
        2,
        'Trần Thị Khách Hàng',
        '0909123456',
        'Phường Bến Nghé',
        'TP. Hồ Chí Minh',
        '123 Lê Lợi, Quận 1',
        TRUE
    ),
    (
        2,
        3,
        'Lê Văn Nhiếp Ảnh',
        '0918123456',
        'Phường Trúc Bạch',
        'Hà Nội',
        '45 Trúc Bạch, Ba Đình',
        TRUE
    );
-- 10. Bảng gio_hang (Giỏ hàng)
INSERT INTO gio_hang (id, nguoi_dung_id)
VALUES (1, 2),
    (2, 3);
-- 11. Bảng chi_tiet_gio_hang (Chi tiết giỏ hàng)
INSERT INTO chi_tiet_gio_hang (id, gio_hang_id, bien_the_san_pham_id, so_luong)
VALUES (1, 1, 4, 1),
    (2, 2, 6, 2);
-- 12. Bảng don_hang (Đơn hàng)
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
        'DH202310001',
        2,
        1,
        'Trần Thị Khách Hàng',
        '0909123456',
        '123 Lê Lợi, Quận 1, TP.HCM',
        'DA_GIAO',
        30000
    ),
    (
        2,
        'DH202310002',
        3,
        2,
        'Lê Văn Nhiếp Ảnh',
        '0918123456',
        '45 Trúc Bạch, Ba Đình, Hà Nội',
        'CHO_XAC_NHAN',
        40000
    );
-- 13. Bảng chi_tiet_don_hang (Chi tiết đơn hàng)
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
        2,
        'Canon EOS R6 Kit 24-105mm',
        59990000,
        1
    ),
    (2, 2, 6, 'Nikon NIKKOR Z 50mm f/1.8', 8990000, 1);
-- 14. Bảng thanh_toan (Thanh toán)
INSERT INTO thanh_toan (
        id,
        don_hang_id,
        so_tien,
        phuong_thuc,
        trang_thai
    )
VALUES (1, 1, 60020000, 'PAYOS_QR', 'DA_THANH_TOAN'),
    (2, 2, 9030000, 'COD', 'CHO_THANH_TOAN');
-- 15. Bảng danh_gia (Đánh giá sản phẩm)
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
        2,
        5,
        'Máy chụp tuyệt vời, chất lượng hình ảnh sắc nét',
        'DA_DUYET'
    ),
    (
        2,
        2,
        5,
        3,
        4,
        'Ống kính tốt, giá hợp lý',
        'DA_DUYET'
    );
-- 16. Bảng phieu_nhap (Phiếu nhập hàng)
INSERT INTO phieu_nhap (
        id,
        nguoi_nhap_id,
        ma_phieu_nhap,
        nha_cung_cap_id
    )
VALUES (1, 1, 'PN202310001', 1),
    (2, 1, 'PN202310002', 2);
-- 17. Bảng chi_tiet_phieu_nhap (Chi tiết phiếu nhập)
INSERT INTO chi_tiet_phieu_nhap (
        id,
        phieu_nhap_id,
        bien_the_san_pham_id,
        so_luong,
        gia_nhap_tung_vat
    )
VALUES (1, 1, 1, 10, 38000000),
    (2, 2, 6, 20, 7500000);
-- 18. Bảng anh_trinh_chieu (Banner trình chiếu)
INSERT INTO anh_trinh_chieu (
        anh_trinh_chieu_id,
        tieu_de,
        hinh_anh_url,
        public_id,
        lien_ket,
        vi_tri,
        trang_thai
    )
VALUES (
        1,
        'Khuyến mãi máy ảnh Canon',
        'https://res.cloudinary.com/store/banners/canon_sale.jpg',
        'canon_sale_banner',
        '/san-pham?thuong-hieu=canon',
        1,
        'HIEU_LUC'
    ),
    (
        2,
        'Ống kính Nikon chính hãng',
        'https://res.cloudinary.com/store/banners/nikon_lens.jpg',
        'nikon_lens_banner',
        '/san-pham?thuong-hieu=nikon',
        2,
        'KHONG_HIEU_LUC'
    );