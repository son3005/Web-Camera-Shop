
/*
Navbar.jsx - menu hover in đậm + đổi màu, logo scroll top, cart badge từ context
*/
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";

export default function Navbar(){
  const { count } = useCart();
  const [mobileOpen, setMobileOpen]=useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" onClick={()=>window.scrollTo({top:0, behavior:'smooth'})} className="text-2xl font-bold text-denNhat">CameraShop</Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="nav-link text-denNhat">Trang chủ</Link>
            <a href="#products" className="nav-link text-denNhat">Sản phẩm</a>
            <a href="#footer" className="nav-link text-denNhat">Giới thiệu</a>
            <a href="#contact" className="nav-link text-denNhat">Liên hệ</a>
            <button className="relative bg-white text-denNhat px-3 py-1 rounded border border-gray-200 hover:bg-xanhLa hover:text-white transition">
              🛒{count>0 && <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">{count}</span>}
            </button>
          </div>
          <div className="md:hidden"><button onClick={()=>setMobileOpen(!mobileOpen)} className="p-2 border rounded">{mobileOpen ? "Đóng":"Menu"}</button></div>
        </div>
      </div>
      {mobileOpen && <div className="md:hidden bg-white border-t"><div className="px-2 pt-2 pb-3 space-y-1"><Link to="/" className="block px-3 py-2 text-denNhat">Trang chủ</Link><a href="#products" className="block px-3 py-2 text-denNhat">Sản phẩm</a><a href="#footer" className="block px-3 py-2 text-denNhat">Giới thiệu</a><a href="#contact" className="block px-3 py-2 text-denNhat">Liên hệ</a></div></div>}
    </nav>
  );
}
