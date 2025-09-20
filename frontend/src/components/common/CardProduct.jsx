// src/components/common/CardProduct.jsx
// 👉 Đây là component hiển thị mỗi sản phẩm (product card)
// Bao gồm: ảnh sản phẩm, tên, giá, và 2 nút hành động ("Mua ngay" & "Thêm giỏ")

import Button from "./Button"; // Dùng component Button tái sử dụng để tạo nút nhất quán toàn web

// Hàm component CardProduct nhận vào 1 prop: product (đối tượng sản phẩm)
export default function CardProduct({ product }) {
  return (
    // Thẻ div chứa toàn bộ card
    // bg-white: nền trắng
    // rounded-lg: bo góc lớn
    // shadow: đổ bóng
    // hover:shadow-xl → bóng đậm hơn khi hover
    // transition: hiệu ứng mượt
    // transform hover:-translate-y-1 → card nhích lên 1px khi hover
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1">
      {/* Ảnh sản phẩm */}
      {/* object-contain: giữ nguyên tỷ lệ ảnh, không bị crop xấu */}
      <img
        src={product.image} // đường dẫn ảnh sản phẩm
        alt={product.name} // alt để SEO + hỗ trợ screen reader
        className="w-full h-40 object-contain rounded-t"
      />

      {/* Phần nội dung thông tin sản phẩm */}
      <div className="p-4 flex flex-col items-center">
        {/* Tên sản phẩm */}
        <h3 className="text-lg font-semibold text-center">{product.name}</h3>

        {/* Giá sản phẩm */}
        {/* toLocaleString("vi-VN") → format số sang tiền Việt (có dấu chấm ngăn cách) */}
        <p className="text-red-600 font-bold mt-2">
          {product.price.toLocaleString("vi-VN")} ₫
        </p>

        {/* Các nút hành động */}
        <div className="mt-4 flex space-x-3">
          {/* Nút mua ngay (primary → xanh lá theo Button.jsx) */}
          <Button type="primary" onClick={() => console.log("Mua:", product)}>
            Mua ngay
          </Button>

          {/* Nút thêm vào giỏ (secondary → viền xám theo Button.jsx) */}
          <Button type="secondary" onClick={() => console.log("Giỏ:", product)}>
            Thêm giỏ
          </Button>
        </div>
      </div>
    </div>
  );
}
