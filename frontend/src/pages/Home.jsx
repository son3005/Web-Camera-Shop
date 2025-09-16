import React from "react";
import Header from "@/components/layout/Header";
import HotProducts from "@/components/home/HotProducts";
import ProductListByBrand from "@/components/home/ProductListByBrand";
import { useCart } from "@/contexts/CartContext";

export default function Home() {
  const { addToCart } = useCart();
  const handleBuyNow = (p) => alert("Mua ngay: " + p.name);
  return (
    <div>
      <Header />
      <HotProducts khiThem={addToCart} khiMua={handleBuyNow} />
      <ProductListByBrand khiThem={addToCart} khiMua={handleBuyNow} />
    </div>
  );
}
