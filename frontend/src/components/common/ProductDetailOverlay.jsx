// ProductDetailOverlay.jsx
// - Làm 1 overlay popup chi tiết sản phẩm, quản lý bằng một "event bus" nội bộ
// - Export cả default component (render overlay) và named export openProductDetail(product)
// - Khi gọi openProductDetail(product) từ bất kỳ file nào -> overlay sẽ mở và hiển thị product
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
  === Event Bus nhẹ (module-scoped) ===
  - productEvent.on(handler)    : đăng ký lắng nghe (handler nhận product)
  - productEvent.off(handler)   : huỷ lắng nghe
  - productEvent.emit(product)  : phát sự kiện mở product
*/
const productEvent = {
  handlers: [],
  on(handler) {
    this.handlers.push(handler);
  },
  off(handler) {
    this.handlers = this.handlers.filter((h) => h !== handler);
  },
  emit(product) {
    this.handlers.forEach((h) => {
      try {
        h(product);
      } catch (e) {
        // tránh crash nếu handler lỗi
        // eslint-disable-next-line no-console
        console.error("productEvent handler error", e);
      }
    });
  },
};

/**
 * openProductDetail(product)
 * - Gọi từ bất kỳ component nào để mở overlay
 * - product có thể là bất kỳ object (id, name, price, image, description, images, specs...)
 */
export function openProductDetail(product) {
  productEvent.emit(product);
}

/**
 * Component ProductDetailOverlay (default export)
 * - Lắng nghe event bus để nhận product và hiển thị overlay.
 * - Có animation nhẹ bằng framer-motion, click nền hoặc nút X để đóng.
 */
export default function ProductDetailOverlay() {
  const [product, setProduct] = useState(null);

  // Đăng ký handler khi component mount
  useEffect(() => {
    const handler = (p) => setProduct(p);
    productEvent.on(handler);
    return () => productEvent.off(handler);
  }, []);

  const close = () => setProduct(null);

  // Nếu không có product -> không render gì (AnimatePresence sẽ quản lý animation)
  return (
    <AnimatePresence>
      {product && (
        <motion.div
          key="product-detail-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
          // click vào nền sẽ đóng overlay
          onClick={close}
          aria-modal="true"
          role="dialog"
        >
          {/* Inner card: ngăn event bubbling để click nội dung không đóng overlay */}
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="bg-white rounded-2xl shadow-2xl w-[min(92%,1100px)] max-h-[90vh] overflow-y-auto relative flex flex-col md:flex-row"
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 text-gray-600 hover:text-black p-2 rounded-full"
              aria-label="Đóng"
            >
              ✕
            </button>

            {/* Left: ảnh chính + thumbnails (nếu có) */}
            <div className="md:w-1/2 p-6 flex flex-col items-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-w-[420px] h-[320px] object-contain rounded-lg"
              />

              {/* thumbnails nếu có product.images */}
              {Array.isArray(product.images) && product.images.length > 0 && (
                <div className="flex gap-3 mt-4 overflow-x-auto">
                  {product.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${product.name}-${idx}`}
                      className="w-16 h-16 object-cover rounded-md border cursor-pointer hover:border-black"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right: thông tin */}
            <div className="md:w-1/2 p-6 flex flex-col">
              <h2 className="text-2xl font-semibold">{product.name}</h2>

              <div className="mt-2">
                <span className="text-3xl font-bold text-red-600">
                  {product.price !== undefined
                    ? Number(product.price).toLocaleString("vi-VN") + " ₫"
                    : "Liên hệ"}
                </span>
              </div>

              {/* Mô tả ngắn */}
              <p className="text-sm text-gray-600 mt-4">
                {product.description ||
                  product.shortDescription ||
                  "Không có mô tả."}
              </p>

              {/* Các tuỳ chọn giả định (colors / storage) */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm">Màu sắc</h4>
                  <div className="flex items-center gap-2 mt-2">
                    {product.colors.map((c, i) => (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-full border"
                        style={{ backgroundColor: c }}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.storage && product.storage.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-sm">Bộ nhớ</h4>
                  <div className="flex gap-2 mt-2">
                    {product.storage.map((s, idx) => (
                      <button
                        key={idx}
                        className="px-3 py-1 border rounded-lg hover:bg-gray-100"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    // Placeholder: integrate cart logic here
                    // eslint-disable-next-line no-alert
                    alert(`Mua ngay: ${product.name}`);
                  }}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700"
                >
                  Mua ngay
                </button>

                <button
                  onClick={() => {
                    // Placeholder: integrate add-to-cart
                    // eslint-disable-next-line no-alert
                    alert(`Thêm vào giỏ: ${product.name}`);
                  }}
                  className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-100"
                >
                  Thêm vào giỏ
                </button>
              </div>

              {/* Specs & warranty (placeholder) */}
              <div className="mt-6">
                <h4 className="font-semibold">Thông số</h4>
                <div className="mt-2 p-3 border rounded-md text-sm text-gray-600">
                  {product.specs ? (
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(product.specs, null, 2)}
                    </pre>
                  ) : (
                    <div>Thông số chi tiết sẽ được cập nhật từ API.</div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold">Bảo hành</h4>
                <div className="mt-2 p-3 border rounded-md text-sm text-gray-600">
                  {product.warranty ||
                    "Bảo hành chính hãng theo quy định nhà sản xuất."}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
