
/*
Header.jsx - banner với overlay text
*/
import React from "react";
import { banner } from "@/data/products";

export default function Header(){ return (
  <header className="w-full relative mt-16">
    <div className="w-full h-96 md:h-[480px] relative overflow-hidden bg-gray-100">
      <img src={banner} alt="banner" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-white text-3xl md:text-5xl font-extrabold">Bắt trọn khoảnh khắc</h1>
        <p className="text-white/90 mt-2 max-w-2xl">Khám phá bộ sưu tập máy ảnh & ống kính chính hãng.</p>
        <button className="mt-4 px-6 py-2 rounded bg-xanhSang text-white hover:bg-xanhDam transition">Khám phá ngay</button>
      </div>
    </div>
  </header>
) }
