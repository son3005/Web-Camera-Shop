// src/components/common/Inventory/AddProduct/productProperties.js

// Cấu trúc mới: Mỗi thuộc tính là một object { key, label }
export const propertyGroups = {
  "Ánh sáng": [
    { key: "iso", label: "ISO" },
    { key: "shutter_speed", label: "Tốc Độ Màn Trập" },
    { key: "metering", label: "Đo Sáng" },
    { key: "white_balance", label: "Cân Bằng Trắng" },
    { key: "continuous_shooting_speed", label: "Tốc Độ Chụp Liên Tục" },
  ],
  "Hình ảnh": [
    { key: "sensor_format", label: "Định Dạng Cảm Biến" },
    { key: "resolution", label: "Độ Phân Giải" },
    { key: "image_size", label: "Kích Thước Ảnh" },
    { key: "aspect_ratio", label: "Tỷ Lệ Ảnh" },
    { key: "sensor_type", label: "Loại Cảm Biến" },
    { key: "image_format", label: "Định Dạng Ảnh" },
    { key: "stabilization", label: "Chống Rung" },
    { key: "lens_mount", label: "Ngàm Ống Kính" },
  ],
  Video: [
    { key: "encoding", label: "Mã Hóa Video" },
    { key: "resolution", label: "Độ Phân Giải Video" },
    { key: "microphone", label: "Micro" },
    { key: "audio_format", label: "Định Dạng Âm Thanh" },
  ],
  "Lấy nét": [
    { key: "type", label: "Kiểu Lấy Nét" },
    { key: "mode", label: "Chế Độ Lấy Nét" },
    { key: "points", label: "Số Điểm Lấy Nét" },
  ],
  "Kính ngắm/Màn hình": [
    { key: "viewfinder_type", label: "Loại kính ngắm" },
    { key: "monitor_features", label: "Đặc Tính Màn Hình" },
    { key: "monitor_resolution", label: "Độ Phân Giải Màn Hình" },
    { key: "monitor_size", label: "Kích Thước Màn Hình" },
    { key: "viewfinder_magnification", label: "Độ Phóng Đại Kính Ngắm" },
    { key: "viewfinder_coverage", label: "Độ Bao Phủ Kính Ngắm" },
    { key: "viewfinder_size", label: "Kích Thước Kính Ngắm" },
    { key: "viewfinder_resolution", label: "Độ Phân Giải Kính Ngắm" },
  ],
  "Đèn Flash": [
    { key: "built_in_flash", label: "Đèn Flash" },
    { key: "flash_mode", label: "Chế Độ Flash" },
    { key: "sync_speed", label: "Tốc Độ Đánh Đèn" },
    { key: "hot_shoe", label: "Chân Kết Nối" },
    { key: "flash_compensation", label: "Độ Bù Sáng" },
    { key: "external_flash_sync", label: "Đồng Bộ Flash" },
  ],
  "Kết Nối": [
    { key: "gps", label: "GPS" },
    { key: "wireless", label: "Kết Nối Không Dây" },
    { key: "jacks", label: "Jack Cắm" },
    { key: "card_slots", label: "Số Khe Cắm Thẻ Nhớ" },
  ],
  Khác: [{ key: "battery", label: "Pin" }],
};
