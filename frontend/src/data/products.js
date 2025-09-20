// Đây là file dữ liệu chứa thông tin các sản phẩm
// Chia theo thương hiệu (brand) để dễ quản lý
// Các ảnh trong "src/assets/images" bạn thay thế theo tên ảnh tương ứng

// 📌 Object chính chứa sản phẩm theo từng thương hiệu
export const productsByBrand = {
  canon: [
    {
      id: "canon1", // ID duy nhất cho sản phẩm (rất quan trọng để React render list)
      name: "Canon EOS R5", // Tên sản phẩm
      price: 82000000, // Giá sản phẩm (đơn vị: VNĐ)
      image: "/src/assets/images/canon_r5.jpg", // Đường dẫn ảnh (tạm thời đặt cứng)
    },
    {
      id: "canon2",
      name: "Canon EOS R6 II",
      price: 62000000,
      image: "/src/assets/images/canon_r6.jpg",
    },
    {
      id: "canon3",
      name: "Canon EOS 90D",
      price: 32000000,
      image: "/src/assets/images/canon_90d.jpg",
    },
    {
      id: "canon4",
      name: "Canon EOS M50",
      price: 18000000,
      image: "/src/assets/images/canon_m50.jpg",
    },
    {
      id: "canon5",
      name: "Canon Powershot G7X",
      price: 15000000,
      image: "/src/assets/images/canon_g7x.jpg",
    },
  ],

  sony: [
    {
      id: "sony1",
      name: "Sony A7 IV",
      price: 58000000,
      image: "/src/assets/images/sony_a7iv.jpg",
    },
    {
      id: "sony2",
      name: "Sony A7C",
      price: 42000000,
      image: "/src/assets/images/sony_a7c.jpg",
    },
    {
      id: "sony3",
      name: "Sony A6400",
      price: 25000000,
      image: "/src/assets/images/sony_a6400.jpg",
    },
    {
      id: "sony4",
      name: "Sony ZV-E10",
      price: 19000000,
      image: "/src/assets/images/sony_zve10.jpg",
    },
    {
      id: "sony5",
      name: "Sony RX100 VII",
      price: 28000000,
      image: "/src/assets/images/sony_rx100.jpg",
    },
  ],

  nikon: [
    {
      id: "nikon1",
      name: "Nikon Z9",
      price: 115000000,
      image: "/src/assets/images/nikon_z9.jpg",
    },
    {
      id: "nikon2",
      name: "Nikon Z7 II",
      price: 72000000,
      image: "/src/assets/images/nikon_z7ii.jpg",
    },
    {
      id: "nikon3",
      name: "Nikon Z6 II",
      price: 52000000,
      image: "/src/assets/images/nikon_z6ii.jpg",
    },
    {
      id: "nikon4",
      name: "Nikon D850",
      price: 56000000,
      image: "/src/assets/images/nikon_d850.jpg",
    },
    {
      id: "nikon5",
      name: "Nikon D7500",
      price: 25000000,
      image: "/src/assets/images/nikon_d7500.jpg",
    },
  ],

  fujifilm: [
    {
      id: "fuji1",
      name: "Fujifilm X-T5",
      price: 42000000,
      image: "/src/assets/images/fuji_xt5.jpg",
    },
    {
      id: "fuji2",
      name: "Fujifilm X-S20",
      price: 32000000,
      image: "/src/assets/images/fuji_xs20.jpg",
    },
    {
      id: "fuji3",
      name: "Fujifilm X-T30 II",
      price: 20000000,
      image: "/src/assets/images/fuji_xt30.jpg",
    },
    {
      id: "fuji4",
      name: "Fujifilm X100V",
      price: 36000000,
      image: "/src/assets/images/fuji_x100v.jpg",
    },
    {
      id: "fuji5",
      name: "Fujifilm GFX 100S",
      price: 135000000,
      image: "/src/assets/images/fuji_gfx100s.jpg",
    },
  ],
};

// 📌 Danh sách sản phẩm nổi bật (Hot products)
// lấy ra từ nhiều brand khác nhau để hiển thị ở carousel HotProducts
export const hotProducts = [
  productsByBrand.canon[0], // Canon EOS R5
  productsByBrand.sony[0], // Sony A7 IV
  productsByBrand.nikon[0], // Nikon Z9
  productsByBrand.fujifilm[0], // Fujifilm X-T5
  productsByBrand.canon[1], // Canon EOS R6 II
  productsByBrand.sony[1], // Sony A7C
  productsByBrand.nikon[1], // Nikon Z7 II
  productsByBrand.fujifilm[1], // Fujifilm X-S20
];

// Export default để import kiểu "import products from '...'"
export default { productsByBrand, hotProducts };
