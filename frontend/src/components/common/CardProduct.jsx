// src/components/common/CardProduct.jsx
// Card sản phẩm có nút "Mua ngay" + "Thêm vào giỏ"

export default function CardProduct({ product }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-xl transition transform hover:-translate-y-1">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-40 object-contain rounded-t"
      />
      <div className="p-4 flex flex-col items-center">
        <h3 className="text-lg font-semibold text-center">{product.name}</h3>
        <p className="text-red-600 font-bold mt-2">
          {product.price.toLocaleString("vi-VN")} ₫
        </p>
        <div className="mt-4 flex space-x-3">
          <button className="px-4 py-2 bg-navy text-white rounded hover:bg-blue-700 active:scale-95 transition">
            Mua ngay
          </button>
          <button className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-900 active:scale-95 transition">
            Thêm giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
