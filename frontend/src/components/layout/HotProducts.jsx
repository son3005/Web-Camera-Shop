// src/components/layout/HotProducts.jsx
// Hiển thị danh sách "Sản phẩm nổi bật" theo dạng carousel (dùng Swiper)

import { Swiper, SwiperSlide } from "swiper/react";
// Swiper + SwiperSlide: component chính để tạo slider

import { Navigation, Autoplay } from "swiper/modules";
// Module bổ sung: Navigation (nút prev/next), Autoplay (chạy tự động)

import "swiper/css"; // CSS mặc định của Swiper
import "swiper/css/navigation"; // CSS cho navigation

import { hotProducts } from "../../data/products";
// Import danh sách sản phẩm nổi bật từ file dữ liệu

import CardProduct from "../common/CardProduct";
// Card sản phẩm tái sử dụng

import SectionTitle from "../common/SectionTitle";
// Component hiển thị tiêu đề section

export default function HotProducts() {
  return (
    <section className="container mx-auto px-4 mt-16" id="hot">
      {/* Tiêu đề section */}
      <SectionTitle>Sản phẩm nổi bật</SectionTitle>

      {/* Swiper slider */}
      <Swiper
        modules={[Navigation, Autoplay]} // Kích hoạt module
        navigation={{
          prevEl: ".custom-prev", // Liên kết nút custom prev
          nextEl: ".custom-next", // Liên kết nút custom next
        }}
        autoplay={{ delay: 3000 }} // Tự động trượt sau 3s
        spaceBetween={20} // Khoảng cách giữa các slide
        slidesPerView={1} // Mặc định hiển thị 1 sp
        breakpoints={{
          640: { slidesPerView: 2 }, // ≥640px hiển thị 2 sp
          1024: { slidesPerView: 4 }, // ≥1024px hiển thị 4 sp
        }}
      >
        {/* Lặp sản phẩm: hotProducts.concat(hotProducts) → nhân đôi để slider dài hơn */}
        {hotProducts.concat(hotProducts).map((p) => (
          <SwiperSlide key={p.id + Math.random()}>
            <CardProduct product={p} /> {/* Render card sản phẩm */}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Nút điều hướng custom (liên kết bằng class) */}
      <div className="flex justify-between mt-4">
        <button className="custom-prev text-3xl text-[var(--color-navy-800)] hover:text-[var(--color-accent-green)]">
          ❮
        </button>
        <button className="custom-next text-3xl text-[var(--color-navy-800)] hover:text-[var(--color-accent-green)]">
          ❯
        </button>
      </div>
    </section>
  );
}

/*
📌 Ghi chú cho partner:
- hotProducts lấy từ src/data/products.js (danh sách sp nổi bật).
- CardProduct quản lý UI của từng sản phẩm (ảnh, tên, giá, nút).
- Swiper hỗ trợ responsive → thay đổi số sản phẩm hiển thị theo màn hình.
- Nếu cần thêm animation: thêm module "EffectFade" hoặc "Pagination".
- Nút ❮ ❯ đã custom, không dùng mặc định → dễ chỉnh style hơn.
*/
