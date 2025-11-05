// src/api/bannerApi.js
export async function getBanners() {
  // nếu sau này bạn có /api/banners thì đổi lại chỗ này
  return [
    {
      image:
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1600",
      title: "Tuần lễ khuyến mãi máy ảnh",
      href: "/products",
      subtitle: "Hàng chính hãng • Giá tốt • Giao nhanh",
    },
    {
      image:
        "https://images.unsplash.com/photo-1499083097717-a156f48fb0f1?q=80&w=1600",
      title: "Ống kính mới vừa cập bến",
      href: "/products",
      subtitle: "Ống kính - phụ kiện",
    },
  ];
}
