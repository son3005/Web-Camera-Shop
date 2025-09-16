
/*
HotProducts.jsx - carousel ngang cho sản phẩm hot
- Có 2 nút mũi tên lớn ở 2 bên, thay đổi màu & kích thước theo yêu cầu
*/
import React, { useRef } from "react";
import Slider from "react-slick";
import ProductCard from "@/components/common/ProductCard";
import products from "@/data/products";

export default function HotProducts({ khiThem, khiMua }){
  const dsHot = products.filter(p=>p.hot);
  const ref = useRef(null);
  const settings = {
    dots:true, infinite:true, speed:500, slidesToShow:3, slidesToScroll:1,
    responsive:[{breakpoint:1024,settings:{slidesToShow:3}},{breakpoint:768,settings:{slidesToShow:2}},{breakpoint:480,settings:{slidesToShow:1}}]
  };
  return (
    <section className="py-10 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-center mb-6 text-denNhat">Sản phẩm nổi bật</h2>
        <button onClick={()=>ref.current.slickPrev()} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-xanhDam text-white shadow hover:bg-xanhSang transition-transform hover:scale-110 text-xl">◀</button>
        <button onClick={()=>ref.current.slickNext()} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-xanhDam text-white shadow hover:bg-xanhSang transition-transform hover:scale-110 text-xl">▶</button>
        <Slider ref={ref} {...settings}>
          {dsHot.map(p => <div key={p.id} className="px-3"><ProductCard sanPham={p} khiThem={khiThem} khiMua={khiMua} /></div>)}
        </Slider>
      </div>
    </section>
  );
}
