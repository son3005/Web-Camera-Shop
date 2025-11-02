# tests/fixtures/sample_data.py
def san_pham_create_data(danh_muc_id, thuong_hieu_id):
    """Tạo dữ liệu mẫu cho sản phẩm."""
    return {
        "danh_muc_id": danh_muc_id,
        "thuong_hieu_id": thuong_hieu_id,
        "ten_san_pham": "Sony A7 IV",
        "mo_ta": "Máy ảnh full-frame",
        "trang_thai": "DANG_BAN",
        "bien_the_san_phams": [
            {
                "ten_bien_the": "Body Only",
                "gia_ban": "50000000",
                "so_luong_ton": 10,
                "hinh_anhs": [
                    {
                        "url": "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                        "public_id": "test/sony_a7iv_1",
                        "alt_text": "Sony A7 IV",
                        "la_anh_dai_dien": True
                    }
                ]
            }
        ]
    }