
/*
Footer.jsx - thông tin + chat icon & box
*/
import React, { useState } from "react";

export default function Footer(){
  const [showChat,setShowChat]=useState(false);
  return (
    <footer id="footer" className="bg-denNhat text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><h3 className="text-xl font-bold">CameraShop</h3><p className="text-gray-300 mt-2">123 Đường ABC, Quận 1, TP.HCM</p><p className="text-gray-300 mt-1">Hotline: 0123 456 789</p></div>
        <div className="text-right md:text-left"><p className="text-gray-400">Chúng tôi chuyên bán máy ảnh, ống kính và phụ kiện chính hãng.</p></div>
      </div>
      <button onClick={()=>setShowChat(s=>!s)} className="fixed bottom-6 right-6 bg-xanhSang text-white p-4 rounded-full shadow-lg hover:bg-xanhDam transition">💬</button>
      {showChat && <div className="fixed bottom-20 right-6 bg-white text-black rounded p-4 w-80 shadow-lg"><div className="text-sm text-gray-700">Nhân viên: Xin chào! Tôi có thể giúp gì?</div><div className="mt-3 flex gap-2"><input className="flex-1 border p-2 rounded" placeholder="Nhập tin nhắn..." /><button className="bg-xanhSang text-white px-3 py-2 rounded hover:bg-xanhDam transition">Gửi</button></div></div>}
      <div className="border-t border-gray-800 text-center py-4 text-gray-400">© 2025 CameraShop. All rights reserved.</div>
    </footer>
  );
}
