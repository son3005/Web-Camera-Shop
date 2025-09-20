// Thanh icon liên hệ (Facebook, Zalo)

export default function SocialBar() {
  return (
    // Container cố định ở góc phải dưới màn hình
    <div className="fixed right-4 bottom-24 flex flex-col gap-3 z-50">
      {/* Link Facebook */}
      <a
        href="https://facebook.com" // URL chuyển hướng đến Facebook
        target="_blank" // Mở tab mới khi click
        className="bg-blue-600 text-white p-3 rounded-full shadow 
                   hover:scale-110 transition"
      >
        Fở Pò {/* Placeholder text → sau này thay bằng icon */}
      </a>

      {/* Link Zalo */}
      <a
        href="https://zalo.me" // URL chuyển hướng đến Zalo
        target="_blank"
        className="bg-cyan-500 text-white p-3 rounded-full shadow 
                   hover:scale-110 transition"
      >
        Zép Lào {/* Placeholder text → sau này thay bằng icon */}
      </a>
    </div>
  );
}
