// src/pages/ProductDetailPage.jsx
// ============================================================
// Trang chi tiết sản phẩm – đã nối đúng với giỏ hàng backend
//  + Đọc đúng product.variants từ productApi
//  + Tồn kho = so_luong_ton / so_luong / stock / (so_luong_nhap - so_luong_ban)
//  + Suy trạng thái sản phẩm từ biến thể nếu top-level không có
// ============================================================

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../api/productApi";
import ProductTabs from "../components/product/ProductTabs";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";

// ✅ Chuẩn hóa trạng thái từ backend -> "dang_ban" | "sap_ban" | "ngung_ban"
const normalizeStatusKey = (raw) => {
  if (typeof raw === "boolean") {
    return raw ? "dang_ban" : "ngung_ban";
  }
  if (typeof raw === "string") {
    const v = raw.trim().toUpperCase();
    if (["DANG_BAN", "DANGBAN", "ACTIVE", "DANG_BAN"].includes(v))
      return "dang_ban";
    if (["SAP_BAN", "SAPBAN", "COMING_SOON"].includes(v)) return "sap_ban";
    if (["NGUNG_BAN", "AN", "INACTIVE"].includes(v)) return "ngung_ban";
  }
  return "ngung_ban";
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();

  // hook giỏ hàng
  const { useAddToCart, useCheckStock } = useCart();
  const addToCart = useAddToCart();
  const checkStock = useCheckStock();

  const { success, error, info } = useToast();

  // load sản phẩm từ API (productApi)
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

  // ===== Xử lý biến thể + ảnh (dùng product.variants từ normalizeProduct) =====
  const { variants, selectedVariant, gallery, displayPrice } = useMemo(() => {
    if (!product)
      return {
        variants: [],
        selectedVariant: null,
        gallery: [],
        displayPrice: 0,
      };

    // 🔥 CHUẨN: getProduct() trả product.variants (đã normalize)
    const varsRaw = Array.isArray(product.variants) ? product.variants : [];

    const currentVariant =
      varsRaw.find((v) => v.id === selectedVariantId) || varsRaw[0] || null;

    // Ảnh:
    // 1. Nếu product.images có -> dùng
    // 2. Nếu không, gom từ hinh_anhs của biến thể
    let imgs = Array.isArray(product.images) ? product.images : [];
    if ((!imgs || imgs.length === 0) && varsRaw.length) {
      imgs = varsRaw
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
      variants: varsRaw,
      selectedVariant: currentVariant,
      gallery: imgs,
      displayPrice: price,
    };
  }, [product, selectedVariantId]);

  // =============== Loading / Error state ===============
  if (isLoading) return <div className="p-6">Đang tải sản phẩm…</div>;
  if (isError || !product)
    return <div className="p-6 text-red-500">Không tải được sản phẩm.</div>;

  // ====== Trạng thái & tồn kho để quyết định có cho mua không ======

  // ✅ Trạng thái sản phẩm:
  //  - productApi hiện không map sẵn trạng thái → ta suy từ biến thể
  const productStatus = (() => {
    const direct =
      product.trang_thai_kich_hoat ?? product.trang_thai ?? product.status;
    if (direct !== undefined && direct !== null) {
      return normalizeStatusKey(direct);
    }

    // Fallback: gom từ biến thể
    let hasActive = false;
    let hasComing = false;
    (variants || []).forEach((v) => {
      const s = normalizeStatusKey(
        v.trang_thai_kich_hoat ?? v.trang_thai ?? v.status
      );
      if (s === "dang_ban") hasActive = true;
      if (s === "sap_ban") hasComing = true;
    });

    if (hasActive) return "dang_ban";
    if (hasComing) return "sap_ban";
    return "ngung_ban";
  })();

  // ✅ Trạng thái biến thể
  const variantStatus = normalizeStatusKey(
    selectedVariant?.trang_thai_kich_hoat ??
      selectedVariant?.trang_thai ??
      selectedVariant?.status
  );

  // ✅ Số lượng tồn:
  //  1. Ưu tiên so_luong_ton / so_luong / stock (nếu BE có)
  //  2. Nếu không → dùng so_luong_nhap - so_luong_ban (schema BE mới)
  const variantQty = (() => {
    const v = selectedVariant;
    if (!v) return 0;

    if (typeof v.so_luong_ton === "number") return v.so_luong_ton;
    if (typeof v.so_luong === "number") return v.so_luong;
    if (typeof v.stock === "number") return v.stock;

    const nhap = Number(v.so_luong_nhap ?? 0);
    const ban = Number(v.so_luong_ban ?? 0);
    const q = nhap - ban;
    return q > 0 ? q : 0;
  })();

  // 🔥 Điều kiện có thể mua
  const canBuy =
    !!selectedVariant &&
    productStatus === "dang_ban" &&
    variantStatus === "dang_ban" &&
    variantQty > 0;

  // ===== Chọn biến thể =====
  const handlePickVariant = (variantId) => {
    setSelectedVariantId(variantId);
    const found = variants.find((v) => v.id === variantId);

    // Lấy ảnh đại diện của biến thể nếu có
    const thumbFromVariant =
      found?.hinh_anhs?.find((img) => img.la_anh_dai_dien)?.url ||
      found?.hinh_anhs?.[0]?.url;

    if (thumbFromVariant) {
      setActiveImage(thumbFromVariant);
    }
  };

  // ===== Thêm vào giỏ =====
  const handleAddToCart = async () => {
    const variant = selectedVariant || variants[0];

    if (!variant?.id) {
      info("Vui lòng chọn biến thể trước khi thêm vào giỏ hàng!");
      return;
    }

    if (!canBuy) {
      info("Sản phẩm / biến thể này hiện không thể mua.");
      return;
    }

    try {
      // 1. kiểm tra tồn kho trên backend
      await checkStock.mutateAsync({
        bienTheId: variant.id,
        soLuong: 1,
      });

      // 2. thêm vào giỏ
      await addToCart.mutateAsync({
        bienTheId: variant.id,
        soLuong: 1,
      });

      success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Add to cart error:", err);
      error(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Có lỗi khi thêm vào giỏ hàng, thử lại!"
      );
    }
  };

  // ===== Mua ngay =====
  const handleBuyNow = () => {
    const variant = selectedVariant || variants[0];
    if (!variant?.id) {
      info("Vui lòng chọn biến thể trước khi mua!");
      return;
    }

    if (!canBuy) {
      info("Sản phẩm / biến thể này hiện không thể mua.");
      return;
    }

    navigate("/checkout", {
      state: {
        productId: product.id,
        variantId: variant.id,
        soLuong: 1,
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
                alt={product.name || product.ten_san_pham}
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
              {product.name || product.ten_san_pham}
            </h1>
            {(product.brand || product.thuong_hieu?.ten_thuong_hieu) && (
              <p className="text-sm text-slate-200 mb-3">
                Thương hiệu:{" "}
                {product.brand || product.thuong_hieu?.ten_thuong_hieu}
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
                disabled={!canBuy || addToCart.isPending}
                className={`px-5 py-2 rounded-lg font-semibold transition ${
                  !canBuy || addToCart.isPending
                    ? "bg-slate-500/70 text-slate-100 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {!canBuy
                  ? "Không thể mua"
                  : addToCart.isPending
                  ? "Đang thêm..."
                  : "Thêm vào giỏ"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!canBuy}
                className={`px-5 py-2 rounded-lg border font-semibold transition ${
                  !canBuy
                    ? "border-slate-500 text-slate-400 cursor-not-allowed"
                    : "border-emerald-500 text-emerald-100 hover:bg-emerald-500/10"
                }`}
              >
                Mua ngay
              </button>
            </div>

            <div className="mt-4 text-sm text-slate-100/80 space-y-1">
              <p>
                {product.description ||
                  product.mo_ta ||
                  "Máy ảnh mirrorless full-frame chuyên nghiệp, hiệu năng cao."}
              </p>
              {selectedVariant && (
                <p>
                  Số lượng còn lại:{" "}
                  <span className="font-medium text-white">{variantQty}</span>
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
        description={product.description || product.mo_ta}
        specs={product.specs || product.thong_so_ky_thuat}
      />
    </div>
  );
}
