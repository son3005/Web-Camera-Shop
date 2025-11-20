// src/pages/ProductDetailPage.jsx
// ============================================================
// Trang chi tiết sản phẩm – đã nối đúng với giỏ hàng backend
// ============================================================

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../api/productApi";
import ProductTabs from "../components/product/ProductTabs";
import { useCart } from "../hooks/useCart";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  // hook giỏ hàng
  const { useAddToCart, useCheckStock } = useCart();
  const addToCart = useAddToCart();
  const checkStock = useCheckStock();

  // load sản phẩm
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct(productId),
  });

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [activeImage, setActiveImage] = useState("");

  const vnd = (n) =>
    Number(n || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "₫";

  // xử lý biến thể + ảnh
  const { variants, selectedVariant, gallery, displayPrice } = useMemo(() => {
    if (!product)
      return {
        variants: [],
        selectedVariant: null,
        gallery: [],
        displayPrice: 0,
      };

    const vars = Array.isArray(product.variants) ? product.variants : [];
    const currentVariant =
      vars.find((v) => v.id === selectedVariantId) || vars[0] || null;

    // ảnh
    let imgs = Array.isArray(product.images) ? product.images : [];
    if ((!imgs || imgs.length === 0) && vars.length) {
      imgs = vars
        .flatMap((v) =>
          Array.isArray(v.hinh_anhs)
            ? v.hinh_anhs.map((img) => img.url).filter(Boolean)
            : []
        )
        .filter(Boolean);
    }

    const price =
      currentVariant?.gia_ban ??
      currentVariant?.price ??
      product.price_from ??
      product.price ??
      0;

    return {
      variants: vars,
      selectedVariant: currentVariant,
      gallery: imgs,
      displayPrice: price,
    };
  }, [product, selectedVariantId]);

  if (isLoading) return <div className="p-6">Đang tải sản phẩm…</div>;
  if (isError || !product)
    return <div className="p-6 text-red-500">Không tải được sản phẩm.</div>;

  // chọn biến thể
  const handlePickVariant = (variantId) => {
    setSelectedVariantId(variantId);
    const found = variants.find((v) => v.id === variantId);
    const thumb =
      found?.hinh_anhs?.find((img) => img.la_anh_dai_dien)?.url ||
      found?.hinh_anhs?.[0]?.url;
    if (thumb) setActiveImage(thumb);
  };

  // thêm giỏ
  const handleAddToCart = async () => {
    const variant = selectedVariant || variants[0];

    if (!variant?.id) {
      alert("Vui lòng chọn biến thể trước khi thêm vào giỏ hàng!");
      return;
    }

    try {
      // 1. kiểm tra tồn kho
      await checkStock.mutateAsync({
        bienTheId: variant.id,
        soLuong: 1,
      });

      // 2. thêm vào giỏ
      await addToCart.mutateAsync({
        bienTheId: variant.id,
        soLuong: 1,
      });

      alert("✅ Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert(
        err?.response?.data?.message || "Có lỗi khi thêm vào giỏ hàng, thử lại!"
      );
    }
  };

  const handleBuyNow = () => {
    const variant = selectedVariant || variants[0];
    if (!variant) {
      alert("Vui lòng chọn biến thể trước khi mua!");
      return;
    }

    navigate("/checkout", {
      state: {
        productId: product.id,
        variantId: variant.id,
        soLuong: 1
      },
    });
  };

  const currentImage = activeImage || gallery[0] || product.primaryImage || "";

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* ===================== KHỐI TRÊN ===================== */}
      <div className="grid lg:grid-cols-3 gap-6 items-stretch">
        {/* CỘT 1: ẢNH */}
        <div className="lg:col-span-1 flex flex-col justify-center">
          <div className="w-full rounded-xl bg-slate-100 object-cover aspect-square overflow-hidden flex items-center justify-center">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-slate-400 text-sm">Không có ảnh</div>
            )}
          </div>

          {gallery && gallery.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {gallery.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`w-16 h-16 rounded-md border overflow-hidden ${
                    img === currentImage
                      ? "border-emerald-500"
                      : "border-slate-200"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* CỘT 2: THÔNG TIN */}
        <div className="lg:col-span-1 flex flex-col justify-center h-full text-center lg:text-left px-4">
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-2xl font-semibold mb-1 text-white">
              {product.name}
            </h1>
            {product.brand && (
              <p className="text-sm text-slate-200 mb-3">
                Thương hiệu: {product.brand}
              </p>
            )}

            <div className="text-3xl font-bold text-emerald-200 mb-4">
              {vnd(displayPrice)}
            </div>

            {variants && variants.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2 text-slate-100">Biến thể</h3>
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handlePickVariant(v.id)}
                      className={`px-3 py-1 rounded-full border text-sm transition ${
                        v.id === (selectedVariant?.id || selectedVariantId)
                          ? "bg-emerald-500 text-white border-emerald-500"
                          : "bg-transparent text-slate-100 border-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {v.ten_bien_the || v.name || v.mau || "Biến thể"} –{" "}
                      {vnd(v.gia_ban || v.price || 0)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center lg:justify-start gap-3 mt-4">
              <button
                onClick={handleAddToCart}
                className="btn-emerald px-5 py-2 rounded-lg font-semibold"
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                className="px-5 py-2 rounded-lg border border-emerald-500 text-emerald-100 hover:bg-emerald-500/10 font-semibold"
              >
                Mua ngay
              </button>
            </div>

            <div className="mt-4 text-sm text-slate-100/80 space-y-1">
              <p>
                {product.description ||
                  "Máy ảnh mirrorless full-frame chuyên nghiệp, hiệu năng cao."}
              </p>
              {selectedVariant?.so_luong != null && (
                <p>
                  Số lượng:{" "}
                  <span className="font-medium text-white">
                    {selectedVariant.so_luong}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CỘT 3: CHÍNH SÁCH */}
        <div className="lg:col-span-1 space-y-3 flex flex-col justify-center h-full">
          <div className="rounded-xl bg-slate-900/40 border border-slate-700 p-4 text-slate-50">
            <h3 className="font-semibold mb-2">Chính sách bán hàng</h3>
            <ul className="text-sm space-y-1">
              <li>✔ Hàng mới 100%, chính hãng</li>
              <li>✔ Bảo hành tại trung tâm uỷ quyền</li>
              <li>✔ Hỗ trợ cài đặt, hướng dẫn sử dụng</li>
            </ul>
          </div>

          <div className="rounded-xl bg-slate-900/40 border border-slate-700 p-4 text-slate-50">
            <h3 className="font-semibold mb-2">Vận chuyển & Đổi trả</h3>
            <ul className="text-sm space-y-1">
              <li>🚚 Giao hàng toàn quốc từ 2-5 ngày</li>
              <li>♻ Đổi mới 7 ngày nếu lỗi nhà sản xuất</li>
              <li>💳 Thanh toán COD / VNPAY</li>
            </ul>
          </div>

          <div className="rounded-xl bg-slate-900/40 border border-slate-700 p-4 text-slate-50">
            <h3 className="font-semibold mb-2">Cần tư vấn thêm?</h3>
            <p className="text-sm mb-2">
              Gọi hotline để được tư vấn combo lens, phụ kiện phù hợp.
            </p>
            <a
              href="tel:19001234"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium"
            >
              1900 1234
            </a>
          </div>
        </div>
      </div>

      {/* KHỐI DƯỚI: TABS */}
      <ProductTabs
        productId={product.id}
        description={product.description}
        specs={product.specs}
      />
    </div>
  );
}
