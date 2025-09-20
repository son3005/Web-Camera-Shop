// src/components/common/Button.jsx
// 👉 Đây là component Nút tái sử dụng (Reusable Button Component).
// Toàn bộ dự án chỉ cần import Button này thay vì viết <button> thủ công.
// Điều này giúp giao diện đồng bộ, dễ thay đổi style toàn cục khi cần.

// Hàm Component Button nhận props từ cha
export default function Button({
  children, // Nội dung hiển thị bên trong nút (text hoặc icon, ví dụ: "Mua ngay", <FaCartPlus /> ...)
  type = "primary", // Loại nút: mặc định là "primary". Có thể truyền "secondary".
  onClick, // Hàm xử lý sự kiện khi click vào nút (truyền từ component cha).
  className = "", // Cho phép truyền thêm class CSS từ ngoài (nếu muốn tùy chỉnh thêm).
}) {
  // 🔹 Style cơ bản chung cho tất cả nút
  // px-4 py-2: padding ngang/dọc
  // rounded-md: bo góc
  // font-medium: font chữ vừa
  // transition: hiệu ứng mượt khi hover/active
  // transform active:scale-95 → khi click thì nút thu nhỏ 95% tạo cảm giác nhấn
  const base =
    "px-4 py-2 rounded-md font-medium transition transform active:scale-95";

  // 🔹 Quy định style cho từng loại nút
  // Nếu là primary → nền xanh lá, chữ trắng, hover xanh đậm hơn
  // Nếu là secondary → viền xám, chữ xám, hover đổi nền xám nhạt
  const styles =
    type === "primary"
      ? `${base} bg-[var(--color-accent-green)] text-white hover:bg-[var(--color-accent-green-600)]`
      : `${base} border border-gray-300 text-gray-700 hover:bg-gray-100`;

  // 🔹 Trả về thẻ button với style và nội dung
  // `${styles} ${className}`: gộp style mặc định + style bổ sung (nếu có)
  return (
    <button onClick={onClick} className={`${styles} ${className}`}>
      {children} {/* Hiển thị text hoặc icon nằm trong nút */}
    </button>
  );
}
