// CardProduct.jsx
// - Hiện thị card sản phẩm: ảnh, tên, giá, 2 nút hành động
// - Khi click vào card (không phải nút), sẽ mở ProductDetailOverlay bằng openProductDetail
import { openProductDetail } from "./ProductDetailOverlay"; // gọi event bus
import Button from "./Button";

export default function CardProduct({ product }) {
  // Khi click vào thẻ (ngoại trừ nhấn vào nút "Thêm giỏ" hoặc "Mua ngay"), ta mở popup
  const handleCardClick = () => {
    openProductDetail(product);
  };

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleCardClick();
      }}
    >
      {/* Ảnh */}
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-contain rounded-t"
      />

      {/* Nội dung */}
      <div
        className="p-4 flex flex-col items-center"
        // Ngăn event bubbling khi click vào các nút bên trong (kẻo đóng overlay do onClick trên card)
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-center">{product.name}</h3>

        <p className="text-red-600 font-bold mt-2">
          {product.price !== undefined
            ? Number(product.price).toLocaleString("vi-VN") + " ₫"
            : "Liên hệ"}
        </p>

        <div className="mt-4 flex space-x-3">
          <Button
            type="primary"
            onClick={() => {
              // Mua ngay (placeholder) — mở overlay cũng hợp lý
              openProductDetail(product);
            }}
          >
            Mua ngay
          </Button>

          <Button
            type="secondary"
            onClick={() => {
              // Thêm vào giỏ (chưa có cart logic) — placeholder alert
              // eslint-disable-next-line no-alert
              alert(`Thêm vào giỏ: ${product.name}`);
            }}
          >
            Thêm giỏ
          </Button>
        </div>
      </div>
    </div>
  );
}
