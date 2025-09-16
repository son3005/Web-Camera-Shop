
/*
ProductCard.jsx - hiển thị 1 sản phẩm
- Có 2 nút: Thêm giỏ & Mua ngay
- Comment tiếng Việt giải thích chức năng
*/
import React from "react";
import { dinhDangTien } from "@/utils/formatPrice";
import { motion } from "framer-motion";

export default function ProductCard({ sanPham, khiThem, khiMua }){
  return (
    <motion.div whileHover={{ y:-6 }} className="bg-white rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition">
      <div className="w-full h-52 bg-gray-100 flex items-center justify-center">
        <img src={sanPham.image} alt={sanPham.name} className="object-contain h-full p-4" />
      </div>
      <div className="p-4">
        <h3 className="text-md font-semibold text-denNhat">{sanPham.name}</h3>
        <div className="text-sm text-xamNhat mt-1">{sanPham.brand}</div>
        <div className="text-xanhDam font-bold mt-3">{dinhDangTien(sanPham.price)}</div>
        <div className="mt-4 flex gap-3">
          <button onClick={()=>khiThem && khiThem(sanPham)} className="flex-1 btn btn-primary">Thêm giỏ</button>
          <button onClick={()=>khiMua && khiMua(sanPham)} className="flex-1 btn btn-secondary">Mua ngay</button>
        </div>
      </div>
    </motion.div>
  );
}
