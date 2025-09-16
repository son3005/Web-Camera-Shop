
/*
ProductListByBrand.jsx - danh sách theo thương hiệu với nút active
*/
import React, { useState, useMemo } from "react";
import ProductCard from "@/components/common/ProductCard";
import products from "@/data/products";

export default function ProductListByBrand({ khiThem, khiMua }){
  const brands = useMemo(()=>["Tất cả", ...Array.from(new Set(products.map(p=>p.brand)))],[]);
  const [brandChon,setBrandChon]=useState("Tất cả");
  const [soHienThi,setSoHienThi]=useState(8);
  const dsHien = brandChon==="Tất cả"? products: products.filter(p=>p.brand===brandChon);
  return (
    <section id="products" className="py-10 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-denNhat">Danh sách sản phẩm</h2>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {brands.map((b,idx)=>(
            <button key={idx} onClick={()=>{setBrandChon(b); setSoHienThi(8);}}
              className={`px-4 py-2 rounded border transition ${brandChon===b? 'bg-xanhSang text-white border-xanhSang':'bg-white text-denNhat border-gray-300 hover:bg-xanhLa hover:text-white'}`}>
              {b}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dsHien.slice(0,soHienThi).map(p=> <ProductCard key={p.id} sanPham={p} khiThem={khiThem} khiMua={khiMua} />)}
        </div>
        <div className="text-center mt-8">
          {soHienThi < dsHien.length ? <button onClick={()=>setSoHienThi(s=>s+4)} className="px-6 py-2 border border-xanhDam text-xanhDam rounded hover:bg-xanhSang hover:text-white transition">Xem thêm</button> : <div className="text-gray-500">Đã hiển thị tất cả sản phẩm</div>}
        </div>
      </div>
    </section>
  );
}
