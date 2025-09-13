# Thư mục trong /src


## **api**
(Thay thế cho 'services') Chuyên xử lý các lời gọi API
---

## **assets**
Chứa các file tĩnh như ảnh, fonts, icon,...

### **images**
Chứa hình ảnh - hình ảnh, icon

### **styles**
Chứa các file style global (variables.css, global.css)
---

## **components**
Chứa các component UI có thể tái sử dụng

### **common**
Các component rất chung: Button, Input, Modal, Spinner,...

### **layout**
Các component thuộc về bố cục: Header, Footer, Sidebar...
---

## **constants**
Chứa các hằng số
- Các file mặc định:
    - *config.js*: Dùng để lưu các cấu hình, key...
    - *routes.js*: Định nghĩa các đường dẫn của trang web
---

## **contexts**
Dành cho State Management với Context API
---

## **hooks**
Chứa các custom hook tự định nghĩa
---

## **layouts**
Định nghĩa các bố cục trang
- Các file mặc định:
    - *MainLayout.jsx*: Bố cục chính (có Header, Footer) cho trang người dùng
    - *AdminLayout.jsx*: Bố cục cho trang quản trị (có Sidebar)
---

## **pages**
Các component tương ứng với một trang hoàn chỉnh
---

## **routes**
Cấu hình và quản lý routing
---

## **utils**
Các hàm tiện ích nhỏ, dùng chung
---

## Giải thích Các Thư mục Mới và Thay đổi

1.  **`api/`** (thay cho `services/`): Tên gọi này rõ ràng hơn, chỉ tập trung vào việc giao tiếp với backend. `axiosClient.js` là một file rất quan trọng để cấu hình chung (như `baseURL`, `headers`, và đặc biệt là *interceptors* để tự động đính kèm token JWT vào mỗi request).

2.  **`hooks/`**: Đây là một trong những thư mục quan trọng nhất. Thay vì viết logic gọi API hay quản lý state trực tiếp trong component, bạn tách chúng ra thành các *custom hook* (ví dụ: `useAuth`, `useCart`). Điều này giúp:
    * Tái sử dụng logic ở nhiều nơi.
    * Component chỉ còn tập trung vào việc hiển thị UI, trở nên "sạch" hơn rất nhiều.

3.  **`contexts/`**: Khi ứng dụng lớn dần, bạn cần một nơi để lưu trữ trạng thái chung (global state) như thông tin người dùng đang đăng nhập, các sản phẩm trong giỏ hàng. React Context là một công cụ có sẵn để làm việc này.

4.  **`layouts/`**: Hầu hết các trang của bạn sẽ có chung một bố cục (ví dụ: luôn có Header và Footer). Thư mục này giúp bạn tạo ra các "khung" trang, và các `pages` chỉ cần điền nội dung vào giữa.

5.  **`constants/`**: Giúp quản lý tập trung các giá trị không đổi như đường dẫn (`/products`, `/cart`), các key dùng cho local storage... Tránh việc "hard-code" các chuỗi này ở nhiều nơi trong code.

6.  **`utils/`**: Chứa các hàm tiện ích thuần túy, không liên quan đến React, ví dụ như hàm định dạng tiền tệ từ `100000` thành `100.000đ`.

Bằng cách áp dụng cấu trúc này, dự án frontend của bạn sẽ trở nên rất chuyên nghiệp, dễ dàng cho các thành viên trong team cùng làm việc, bảo trì và mở rộng trong tương lai.
