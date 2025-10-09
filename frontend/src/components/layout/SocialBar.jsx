import { FaFacebookF } from "react-icons/fa";
import { SiZalo } from "react-icons/si";

export default function SocialBar() {
  return (
    <div className="fixed right-4 bottom-24 flex flex-col gap-3 z-50">
      {/* Link Facebook */}
      <a
        href="https://facebook.com" // URL chuyển hướng đến Facebook
        target="_blank" // Mở tab mới khi click
        rel="noopener noreferrer"
        className="bg-blue-600 text-white p-3 rounded-full shadow-lg 
                   hover:scale-110 hover:shadow-xl transition-all duration-300"
        title="Liên hệ qua Facebook"
      >
        <FaFacebookF size={22} /> {/* Icon Facebook */}
      </a>

      {/* Link Zalo */}
      <a
        href="https://zalo.me" // URL chuyển hướng đến Zalo
        target="_blank"
        rel="noopener noreferrer"
        className="bg-cyan-500 text-white p-3 rounded-full shadow-lg 
                   hover:scale-110 hover:shadow-xl transition-all duration-300"
        title="Liên hệ qua Zalo"
      >
        <SiZalo size={22} /> {/* Icon Zalo */}
      </a>
    </div>
  );
}

/*
📝 Ghi chú:
- Dùng `react-icons/fa` (Facebook) và `react-icons/si` (Zalo).
- Kích thước icon ~22px để cân đối với padding p-3.
- Giữ hiệu ứng hover: scale + shadow để tạo cảm giác nổi.
- Thuộc tính `rel="noopener noreferrer"` để tăng bảo mật khi mở tab mới.
- Nếu muốn thêm tooltip hoặc animation lắc, có thể dùng thêm Framer Motion sau.
*/
