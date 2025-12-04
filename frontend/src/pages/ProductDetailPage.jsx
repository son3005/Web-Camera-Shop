// src/pages/ProductDetailPage.jsx
// ============================================================
// Product Detail Page – Light UI (Style C)
// ============================================================

import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "../api/productApi";
import ProductTabs from "../components/product/ProductTabs";
import { useCart } from "../hooks/useCart";
import { useToast } from "../hooks/useToast";

const normalizeStatusKey = (raw) => {
  if (typeof raw === "boolean") return raw ? "dang_ban" : "ngung_ban";
  if (typeof raw === "string") {
    const v = raw.trim().toUpperCase();
    if (["DANG_BAN", "ACTIVE"].includes(v)) return "dang_ban";
    if (["SAP_BAN", "COMING_SOON"].includes(v)) return "sap_ban";
    if (["NGUNG_BAN", "INACTIVE"].includes(v)) return "ngung_ban";
  }
  return "ngung_ban";
};

// Label biến thể: "Tên biến thể – Màu"
const getVariantLabel = (v) => {
  const baseName = v.ten_bien_the || v.name || "Biến thể";
  const color = v.mau || v.ten_mau || v.color || "";
  return color ? `${baseName} – ${color}` : baseName;
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { useAddToCart, useCheckStock } = useCart();
  const addToCart = useAddToCart();
  const checkStock = useCheckStock();
  const { success, error, info } = useToast();

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
    Number(n || 0).toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    }) + "₫";

  const { variants, selectedVariant, gallery, displayPrice } = useMemo(() => {
    if (!product)
      return {
        variants: [],
        selectedVariant: null,
        gallery: [],
        displayPrice: 0,
      };

    const varsRaw = Array.isArray(product.variants) ? product.variants : [];

    const currentVariant =
      varsRaw.find((v) => v.id === selectedVariantId) || varsRaw[0] || null;

    // ==== ẢNH ====
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

  // ====== TRẠNG THÁI & TỒN KHO ======
  const productStatus = (() => {
    const direct =
      product?.trang_thai_kich_hoat ?? product?.trang_thai ?? product?.status;
    if (direct !== undefined && direct !== null)
      return normalizeStatusKey(direct);

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

  const variantStatus = normalizeStatusKey(
    selectedVariant?.trang_thai_kich_hoat ??
      selectedVariant?.trang_thai ??
      selectedVariant?.status
  );

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

  const canBuy =
    !!selectedVariant &&
    productStatus === "dang_ban" &&
    variantStatus === "dang_ban" &&
    variantQty > 0;

  // ====== CHỌN BIẾN THỂ ======
  const handlePickVariant = (id) => {
    setSelectedVariantId(id);
    const found = variants.find((v) => v.id === id);

    const thumb =
      found?.hinh_anhs?.find((img) => img.la_anh_dai_dien)?.url ||
      found?.hinh_anhs?.[0]?.url;

    if (thumb) setActiveImage(thumb);
  };

  // ====== THÊM VÀO GIỎ ======
  const handleAddToCart = async () => {
    const variant = selectedVariant || variants[0];
    if (!variant?.id) {
      info("Vui lòng chọn biến thể!");
      return;
    }
    if (!canBuy) {
      info("Sản phẩm / biến thể này không thể mua.");
      return;
    }

    try {
      await checkStock.mutateAsync({
        bienTheId: variant.id,
        soLuong: 1,
      });

      await addToCart.mutateAsync({
        bienTheId: variant.id,
        soLuong: 1,
      });

      //success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  const handleBuyNow = () => {
    const variant = selectedVariant || variants[0];
    if (!variant?.id) return info("Vui lòng chọn biến thể!");

    if (!canBuy) return info("Sản phẩm hiện không thể mua.");

    navigate("/checkout", {
      state: {
        productId: product.id,
        variantId: variant.id,
        soLuong: 1,
      },
    });
  };

  const currentImage =
    activeImage || gallery?.[0] || product?.primaryImage || "";

  // LOADING / ERROR
  if (isLoading) return <div className="p-6">Đang tải…</div>;
  if (isError || !product)
    return <div className="p-6 text-red-500">Không tải được sản phẩm.</div>;

  // ============================================================
  // UI — LIGHT MODE — WHITE + EMERALD + SHADOW
  // ============================================================

  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      {/* ===================== KHỐI TRÊN ===================== */}
      <div className="grid lg:grid-cols-3 gap-10 items-start">
        {/* ===== CỘT 1: ẢNH ===== */}
        <div>
          <div className="w-full aspect-square rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
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
            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
              {gallery.map((img) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-xl border overflow-hidden shadow-sm transition
                    ${
                      img === currentImage
                        ? "border-emerald-500"
                        : "border-slate-200 hover:border-emerald-300"
                    }
                  `}
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

        {/* ===== CỘT 2: THÔNG TIN ===== */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">
            {product.name || product.ten_san_pham}
          </h1>

          {(product.brand || product.thuong_hieu?.ten_thuong_hieu) && (
            <p className="text-sm text-slate-600">
              Thương hiệu:{" "}
              <span className="font-medium text-slate-800">
                {product.brand || product.thuong_hieu?.ten_thuong_hieu}
              </span>
            </p>
          )}

          <div className="text-4xl font-bold text-emerald-600">
            {vnd(displayPrice)}
          </div>

          {/* Biến thể */}
          {variants?.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-800">Biến thể</h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => handlePickVariant(v.id)}
                    className={`px-4 py-1.5 rounded-full border text-sm transition
                      ${
                        v.id === (selectedVariant?.id || selectedVariantId)
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-300 hover:border-emerald-400"
                      }
                    `}
                  >
                    {getVariantLabel(v)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Nút */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!canBuy || addToCart.isPending}
              className={`px-6 py-2.5 rounded-xl font-semibold shadow-sm transition
                ${
                  !canBuy || addToCart.isPending
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }
              `}
            >
              {addToCart.isPending ? "Đang thêm..." : "Thêm vào giỏ"}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!canBuy}
              className={`px-6 py-2.5 rounded-xl font-semibold border transition
                ${
                  !canBuy
                    ? "border-slate-300 text-slate-400 cursor-not-allowed"
                    : "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                }
              `}
            >
              Mua ngay
            </button>
          </div>

          {selectedVariant && (
            <p className="text-sm text-slate-700">
              Số lượng hàng còn lại:{" "}
              <span className="font-semibold text-emerald-600">
                {variantQty}
              </span>
            </p>
          )}
        </div>

        {/* ===== CỘT 3: CHÍNH SÁCH ===== */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold mb-2 text-slate-900">
              Chính sách bán hàng
            </h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>✔ Hàng mới 100%, chính hãng</li>
              <li>✔ Bảo hành tại trung tâm uỷ quyền</li>
              <li>✔ Hỗ trợ cài đặt & tư vấn</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold mb-2 text-slate-900">
              Vận chuyển & Đổi trả
            </h3>
            <ul className="text-sm text-slate-700 space-y-1">
              <li>🚚 Giao nhanh 2–5 ngày toàn quốc</li>
              <li>♻ Đổi mới 7 ngày nếu lỗi NSX</li>
              <li>💳 Thanh toán COD / VNPAY</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5">
            <h3 className="font-semibold mb-2 text-slate-900">Cần tư vấn?</h3>
            <p className="text-sm text-slate-700 mb-3">
              Gọi hotline để được tư vấn combo lens & phụ kiện phù hợp.
            </p>
            <a
              href="tel:19001234"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-sm"
            >
              1900 1234
            </a>
          </div>
        </div>
      </div>

      {/* ===================== TABS (Overview / Specs / Reviews) ===================== */}
      <ProductTabs
        productId={product.id}
        description={product.description || product.mo_ta}
        specs={product.specs || product.thong_so_ky_thuat}
      />
    </div>
  );
}
