// src/components/layout/SocialBar.jsx
// Thanh icon liên hệ (Facebook, Zalo)

export default function SocialBar() {
  return (
    <div className="fixed right-4 bottom-24 flex flex-col gap-3 z-50">
      <a
        href="https://facebook.com"
        target="_blank"
        className="bg-blue-600 text-white p-3 rounded-full shadow hover:scale-110 transition"
      >
        Fở Pò
      </a>
      <a
        href="https://zalo.me"
        target="_blank"
        className="bg-cyan-500 text-white p-3 rounded-full shadow hover:scale-110 transition"
      >
        Zép Lào
      </a>
    </div>
  );
}
