// src/components/common/SectionTitle.jsx
// Mục đích: tái sử dụng để tất cả tiêu đề section có cùng style (font, màu, căn giữa)

export default function SectionTitle({ children }) {
  // children: Nội dung text được truyền vào giữa component này (vd: <SectionTitle>Danh sách sản phẩm</SectionTitle>)
  return (
    <h2
      className="
        text-2xl               // font-size lớn (≈ 24px)
        font-bold              // chữ đậm
        mb-6                   // margin-bottom 1.5rem (tạo khoảng cách với nội dung bên dưới)
        text-[var(--color-navy-800)] // màu chữ xanh navy (lấy từ biến CSS trong index.css)
        text-center            // căn giữa
      "
    >
      {children} {/* Hiển thị nội dung tiêu đề được truyền vào */}
    </h2>
  );
}
