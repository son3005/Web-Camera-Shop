USE myshop;
INSERT INTO danh_muc (ma_danh_muc, ten_danh_muc)
VALUES ('MML', 'Máy ảnh Mirrorless'),
    ('DSL', 'Máy ảnh DSLR'),
    ('LEN', 'Ống kính'),
    ('ACC', 'Phụ kiện');
-- ========================================
-- 2. DỮ LIỆU THƯƠNG HIỆU
-- ========================================
INSERT INTO thuong_hieu (
        ma_thuong_hieu,
        ten_thuong_hieu,
        logo_url,
        public_id
    )
VALUES (
        'CAN',
        'Canon',
        'https://res.cloudinary.com/demo/image/upload/canon_logo.jpg',
        'brands/canon_logo'
    ),
    (
        'SON',
        'Sony',
        'https://res.cloudinary.com/demo/image/upload/sony_logo.png',
        'brands/sony_logo'
    ),
    (
        'NIK',
        'Nikon',
        'https://res.cloudinary.com/demo/image/upload/nikon_logo.jpg',
        'brands/nikon_logo'
    );
-- ========================================
-- 3. DỮ LIỆU NGƯỜI DÙNG (1 admin + 2 khách)
-- ========================================
INSERT INTO nguoi_dung (
        ma_nguoi_dung,
        ho_ten,
        email,
        mat_khau_hash,
        so_dien_thoai,
        vai_tro,
        trang_thai
    )
VALUES (
        'ADMIN001',
        'Quản Trị Viên',
        'admin@shop.com',
        '$2b$12$lzCWtWJcmd24tUF.Dd6WvedqyP52NPiz4Xmw8CWHwalUbBfJgXIai',
        '0123456789',
        'QUAN_TRI_VIEN',
        'KICH_HOAT'
    ),
    (
        'KH001',
        'Nguyễn Văn A',
        'khach1@shop.com',
        '$2b$12$9kRjF6zXvLmNqP8sTuVwY.3dQwErT5hGxYcK2nJpRt1fB8vHc9kZa',
        '0901234567',
        'KHACH_HANG',
        'KICH_HOAT'
    ),
    (
        'KH002',
        'Trần Thị B',
        'khach2@shop.com',
        '$2b$12$WqZkL3mNpQrT5vXy8s9cOe7fGhJkL2mNxYvB9cRt1sPqEw3dFg4Hi',
        '0909876543',
        'KHACH_HANG',
        'KICH_HOAT'
    );
-- GHI CHÚ: Dùng bcrypt trong Python để tạo hash
-- Ví dụ: bcrypt.generate_password_hash("admin123").decode('utf-8')
-- ========================================
-- 4. DỮ LIỆU ĐỊA CHỈ (cho admin + khách)
-- ========================================
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
        'Quản Trị Viên',
        '0123456789',
        'Phường 1',
        'TP.HCM',
        '123 Đường ABC',
        '700000',
        TRUE
    ),
    (
        2,
        'Nguyễn Văn A',
        '0901234567',
        'Phường 5',
        'Hà Nội',
        '456 Đường XYZ',
        '100000',
        TRUE
    ),
    (
        3,
        'Trần Thị B',
        '0909876543',
        'Phường 3',
        'Đà Nẵng',
        '789 Đường KLM',
        '550000',
        TRUE
    );
-- ========================================
-- 5. DỮ LIỆU GIỎ HÀNG (tạo tự động khi cần)
-- ========================================
INSERT INTO gio_hang (nguoi_dung_id)
VALUES (1),
    (2),
    (3);
-- ========================================
-- 6. DỮ LIỆU SẢN PHẨM
-- ========================================
INSERT INTO san_pham (
        ma_san_pham,
        danh_muc_id,
        thuong_hieu_id,
        ten_san_pham,
        mo_ta,
        thong_so_ky_thuat,
        trang_thai
    )
VALUES (
        'SP001',
        1,
        1,
        'Canon EOS R5',
        'Máy ảnh mirrorless full-frame cao cấp',
        '{"sensor": "45MP", "video": "8K", "ibis": true}',
        'DANG_BAN'
    ),
    (
        'SP002',
        1,
        2,
        'Sony A7 IV',
        'Máy ảnh hybrid chụp ảnh và quay phim',
        '{"sensor": "33MP", "video": "4K60", "ibis": true}',
        'DANG_BAN'
    ),
    (
        'SP003',
        3,
        1,
        'Canon RF 24-70mm f/2.8L',
        'Ống kính zoom chuyên nghiệp',
        '{"focal": "24-70mm", "aperture": "f/2.8", "weight": "900g"}',
        'DANG_BAN'
    );
-- ========================================
-- 7. DỮ LIỆU BIẾN THỂ SẢN PHẨM
-- ========================================
INSERT INTO bien_the_san_pham (
        san_pham_id,
        ten_bien_the,
        trang_thai_kich_hoat,
        gia_ban,
        gia_khuyen_mai,
        so_luong_ton
    )
VALUES (
        1,
        'Body Only - Black',
        'DANG_BAN',
        85000000,
        79900000,
        10
    ),
    (
        1,
        'Kit RF 24-105mm',
        'DANG_BAN',
        105000000,
        99900000,
        5
    ),
    (2, 'Body Only', 'DANG_BAN', 65000000, NULL, 15),
    (
        3,
        'Chính hãng VN',
        'DANG_BAN',
        45000000,
        42000000,
        20
    );
-- ========================================
-- 8. DỮ LIỆU HÌNH ẢNH
-- ========================================
INSERT INTO hinh_anh_san_pham (
        bien_the_id,
        url,
        public_id,
        alt_text,
        la_anh_dai_dien
    )
VALUES (
        1,
        'https://res.cloudinary.com/demo/image/upload/canon_r5_black.jpg',
        'san_pham/canon_r5_black_1',
        'Canon R5 Black - Mặt trước',
        TRUE
    ),
    (
        1,
        'https://res.cloudinary.com/demo/image/upload/canon_r5_black_back.jpg',
        'san_pham/canon_r5_black_2',
        'Canon R5 Black - Mặt sau',
        FALSE
    ),
    (
        2,
        'https://res.cloudinary.com/demo/image/upload/canon_r5_kit.jpg',
        'san_pham/canon_r5_kit',
        'Canon R5 + RF 24-105mm',
        TRUE
    ),
    (
        3,
        'https://res.cloudinary.com/demo/image/upload/sony_a7iv.jpg',
        'san_pham/sony_a7iv',
        'Sony A7 IV',
        TRUE
    ),
    (
        4,
        'https://res.cloudinary.com/demo/image/upload/canon_rf2470.jpg',
        'san_pham/canon_rf2470',
        'Canon RF 24-70mm f/2.8L',
        TRUE
    );
-- ========================================
-- 9. DỮ LIỆU ĐƠN HÀNG (1 đơn hoàn thành)
-- ========================================
INSERT INTO don_hang (
        ma_don_hang,
        nguoi_dung_id,
        dia_chi_id,
        ten_nguoi_nhan,
        so_dien_thoai_nguoi_nhan,
        dia_chi_giao,
        trang_thai,
        phi_van_chuyen,
        giam_gia,
        ghi_chu
    )
VALUES (
        'DH20251031001',
        2,
        2,
        'Nguyễn Văn A',
        '0901234567',
        '456 Đường XYZ, Phường 5, Hà Nội',
        'HOAN_THANH',
        30000,
        500000,
        'Giao buổi sáng'
    );
-- ========================================
-- 10. DỮ LIỆU CHI TIẾT ĐƠN HÀNG
-- ========================================
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
        'Canon EOS R5',
        'Body Only - Black',
        79900000,
        1
    );
-- ========================================
-- 11. DỮ LIỆU THANH TOÁN
-- ========================================
INSERT INTO thanh_toan (
        don_hang_id,
        so_tien,
        phuong_thuc,
        trang_thai,
        ma_giao_dich_ben_thu_3
    )
VALUES (
        1,
        79930000,
        'COD',
        'DA_THANH_TOAN',
        'VNP123456789'
    );
-- ========================================
-- 12. DỮ LIỆU ĐÁNH GIÁ
-- ========================================
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
        2,
        5,
        'Máy ảnh tuyệt vời, giao hàng nhanh!',
        'DA_DUYET'
    );
-- ========================================
-- 13. DỮ LIỆU GIỎ HÀNG (khách đang mua)
-- ========================================
INSERT INTO chi_tiet_gio_hang (gio_hang_id, bien_the_san_pham_id, so_luong)
VALUES (3, 3, 1),
    -- Khách 2 thêm Sony A7 IV
    (2, 4, 2);
-- Khách 1 thêm 2 ống kính Canon
-- ========================================
-- HOÀN TẤT
-- ========================================
SELECT 'DỮ LIỆU KHỞI ĐẦU ĐÃ TẠO THÀNH CÔNG!' AS status;