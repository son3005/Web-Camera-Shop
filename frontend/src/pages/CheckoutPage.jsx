// ==========================
// CheckoutPage.jsx (COD = đơn thật – PayOS = đơn ảo)
// ==========================

import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { getProduct } from "../api/productApi";
import { taoDonHangAo } from "../api/paymentApi";
import { layDanhSachDiaChi, taoDiaChi } from "../api/addressApi";
import { layThongTinCaNhan } from "../api/userApi";
import { kiemTraTonKho, xoaKhoiGioHang } from "../api/gioHangApi"; // ✅ thêm xóa giỏ

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const queryClient = useQueryClient();

  // 1) MULTI CHECKOUT (từ giỏ hàng)
  const itemsFromCart = state?.items || null;
  const isCartCheckout =
    Array.isArray(itemsFromCart) && itemsFromCart.length > 0;

  // 👉 ID giỏ hàng (nếu checkout từ giỏ)
  const gioHangId = isCartCheckout
    ? state?.gio_hang_id ??
      state?.gioHangId ??
      state?.cartId ??
      itemsFromCart?.[0]?.gio_hang_id ??
      null
    : null;

  // 2) SINGLE CHECKOUT (mua ngay)
  const productId = state?.productId || null;
  const variantId = state?.variantId || null;
  const soLuongInitial = state?.soLuong || 1;

  const isSingleCheckout = !isCartCheckout && !!productId && !!variantId;

  // --- dữ liệu sản phẩm (single) ---
  const { data: product, isLoading } = useQuery({
    queryKey: ["checkout-product", productId],
    queryFn: () => getProduct(productId),
    enabled: isSingleCheckout,
  });

  // --- PROFILE USER ---
  const { data: profileData } = useQuery({
    queryKey: ["user-profile"],
    queryFn: layThongTinCaNhan,
  });

  // --- DANH SÁCH ĐỊA CHỈ ---
  const { data: addressData } = useQuery({
    queryKey: ["user-addresses"],
    queryFn: layDanhSachDiaChi,
  });

  const addresses = useMemo(() => {
    if (!addressData) return [];
    if (Array.isArray(addressData)) return addressData;
    if (Array.isArray(addressData.data)) return addressData.data;
    return [];
  }, [addressData]);

  // helper địa chỉ hiển thị
  const getAddressString = (addr) => {
    if (!addr) return "";
    if (addr.dia_chi_cu_the) return addr.dia_chi_cu_the;

    const parts = [];
    if (addr.dia_chi) parts.push(addr.dia_chi);
    if (addr.dia_chi_giao) parts.push(addr.dia_chi_giao);
    if (addr.dia_chi_chi_tiet) parts.push(addr.dia_chi_chi_tiet);
    if (addr.phuong_xa) parts.push(addr.phuong_xa);
    if (addr.tinh_thanh) parts.push(addr.tinh_thanh);
    return parts.join(", ");
  };

  const defaultAddress = useMemo(() => {
    if (!addresses.length) return null;
    return (
      addresses.find(
        (a) => a.la_mac_dinh || a.mac_dinh || a.is_default || a.default === true
      ) || addresses[0]
    );
  }, [addresses]);

  // --- chọn địa chỉ trong dropdown ---
  const [selectedAddressId, setSelectedAddressId] = useState("new");
  const [hasInitAddressSelection, setHasInitAddressSelection] = useState(false);

  useEffect(() => {
    if (!hasInitAddressSelection && addresses.length > 0) {
      setSelectedAddressId(
        defaultAddress?.id?.toString() || addresses[0].id.toString()
      );
      setHasInitAddressSelection(true);
    }
    if (!addresses.length) {
      setSelectedAddressId("new");
    }
  }, [addresses, defaultAddress, hasInitAddressSelection]);

  // --- số lượng SINGLE ---
  const [soLuong, setSoLuong] = useState(soLuongInitial);

  // --- danh sách item CART + số lượng ---
  const [cartItems, setCartItems] = useState(() =>
    itemsFromCart ? itemsFromCart.map((it) => ({ ...it })) : []
  );

  useEffect(() => {
    if (itemsFromCart) {
      setCartItems(itemsFromCart.map((it) => ({ ...it })));
    } else {
      setCartItems([]);
    }
  }, [itemsFromCart]);

  // FORM giao hàng
  const [form, setForm] = useState({
    ten_nguoi_nhan: "",
    so_dien_thoai_nguoi_nhan: "",
    dia_chi_giao: "",
    phuong_xa: "",
    tinh_thanh: "",
    ghi_chu: "",
    phuong_thuc_thanh_toan: "cod",
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // Prefill form khi đổi lựa chọn địa chỉ
  useEffect(() => {
    const addr = addresses.find(
      (a) => String(a.id) === String(selectedAddressId)
    );

    if (addr) {
      setForm((prev) => ({
        ...prev,
        ten_nguoi_nhan:
          addr.ten_nguoi_nhan || addr.ho_ten || prev.ten_nguoi_nhan || "",
        so_dien_thoai_nguoi_nhan:
          addr.so_dien_thoai || addr.sdt || prev.so_dien_thoai_nguoi_nhan || "",
        dia_chi_giao: getAddressString(addr) || prev.dia_chi_giao || "",
        phuong_xa: addr.phuong_xa || prev.phuong_xa || "",
        tinh_thanh: addr.tinh_thanh || prev.tinh_thanh || "",
      }));
    } else if (selectedAddressId === "new") {
      const profile = profileData || {};
      setForm((prev) => ({
        ...prev,
        ten_nguoi_nhan:
          prev.ten_nguoi_nhan ||
          profile.ho_ten ||
          profile.ten ||
          profile.full_name ||
          "",
        so_dien_thoai_nguoi_nhan:
          prev.so_dien_thoai_nguoi_nhan ||
          profile.so_dien_thoai ||
          profile.sdt ||
          profile.phone ||
          "",
      }));
    }
  }, [selectedAddressId, addresses, profileData]);

  // ================================
  // HÀM LẤY TỒN KHO (CHO SINGLE)
  // ================================
  const getVariantStock = (variantObj) => {
    if (!variantObj) return null;

    if (
      typeof variantObj.so_luong_nhap === "number" &&
      typeof variantObj.so_luong_ban === "number"
    ) {
      return Math.max(0, variantObj.so_luong_nhap - variantObj.so_luong_ban);
    }

    if (typeof variantObj.so_luong_toi_da === "number") {
      return variantObj.so_luong_toi_da;
    }

    return null;
  };

  const variant = useMemo(() => {
    if (!product || !isSingleCheckout) return null;
    return product.variants.find((v) => v.id === variantId) || null;
  }, [product, variantId, isSingleCheckout]);

  useEffect(() => {
    if (isSingleCheckout && variant) {
      const stock = getVariantStock(variant);
      if (stock != null && soLuong > stock) {
        setSoLuong(stock);
      }
    }
  }, [isSingleCheckout, variant, soLuong]);

  // HÀM LẤY MESSAGE LỖI
  const getErrorMessage = (err) =>
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Có lỗi xảy ra, vui lòng thử lại";

  // PARSE kết quả check tồn kho
  const parseStockCheckResult = (result, requestedQty) => {
    console.log("🔍 KQ /kiem-tra-ton-kho:", result, "yeu cau:", requestedQty);

    if (!result) return { ok: true };

    // CASE backend hiện tại: { bien_the_san_pham_id, du_so_luong: boolean, so_luong_yeu_cau }
    if (typeof result.du_so_luong === "boolean") {
      if (!result.du_so_luong) {
        return {
          ok: false,
          message: "Số lượng yêu cầu vượt quá số lượng tồn kho.",
        };
      }
      return { ok: true };
    }

    // Dự phòng
    if (typeof result.is_valid === "boolean") {
      if (!result.is_valid) {
        return {
          ok: false,
          message:
            result.message || "Số lượng yêu cầu vượt quá số lượng tồn kho.",
        };
      }
      return { ok: true };
    }

    if (typeof result.valid === "boolean") {
      if (!result.valid) {
        return {
          ok: false,
          message:
            result.message || "Số lượng yêu cầu vượt quá số lượng tồn kho.",
        };
      }
      return { ok: true };
    }

    let max = null;
    if (typeof result.so_luong_toi_da === "number") {
      max = result.so_luong_toi_da;
    } else if (typeof result.so_luong_con_lai === "number") {
      max = result.so_luong_con_lai;
    } else if (typeof result.available_quantity === "number") {
      max = result.available_quantity;
    }

    if (max != null && requestedQty > max) {
      return {
        ok: false,
        message: `Sản phẩm chỉ còn ${max} sản phẩm trong kho.`,
      };
    }

    return { ok: true };
  };

  // ✅ GỌI SERVER CHECK TỒN KHO
  const checkStockOnServer = async (bienTheId, requestedQty) => {
    try {
      const result = await kiemTraTonKho({
        bienTheId,
        soLuong: requestedQty,
      });
      const parsed = parseStockCheckResult(result, requestedQty);
      if (!parsed.ok) {
        return { ok: false, message: parsed.message };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, message: getErrorMessage(err) };
    }
  };

  // MUTATION TẠO ĐỊA CHỈ MỚI
  const createAddressMutation = useMutation({
    mutationFn: taoDiaChi,
  });

  // MUTATION ĐƠN HÀNG — COD & PAYOS
  const orderMutation = useMutation({
    mutationFn: taoDonHangAo,
    onSuccess: async (res) => {
      const data = res.data || res;

      // Nếu là PayOS → chuyển ngay sang trang PayOS, KHÔNG xóa giỏ
      if (form.phuong_thuc_thanh_toan === "payos_qr") {
        window.location.href = data.payment_url || data.data?.payment_url || "";
        return;
      }

      // ✅ COD + checkout từ giỏ → cố gắng xóa item trong giỏ
      if (isCartCheckout && cartItems.length > 0) {
        try {
          const ids = cartItems
            .map((it) => it.id)
            .filter((v) => v !== null && v !== undefined);

          await Promise.all(ids.map((id) => xoaKhoiGioHang(id)));
        } catch (err) {
          console.error("❌ Lỗi xóa sản phẩm khỏi giỏ sau khi đặt hàng:", err);
          // không chặn luồng điều hướng
        }
      }

      // Invalidate cache giỏ hàng
      try {
        queryClient.invalidateQueries({ queryKey: ["gio-hang"] });
      } catch (e) {
        console.warn("invalidate gio-hang fail", e);
      }

      const id = data.id || data.data?.id;
      navigate(`/payment-result/${id}?status=cod_thanhcong`);
    },
    onError: (err) => {
      alert(getErrorMessage(err));
      console.error("❌ Lỗi tạo đơn hàng:", err);
    },
  });

  const isSubmitting =
    orderMutation.isLoading || createAddressMutation.isLoading;

  // ================================
  // CÁC TRẠNG THÁI VALIDATION / LOADING
  // ================================
  if (!isCartCheckout && !isSingleCheckout) {
    return <div className="p-6">❌ Thiếu dữ liệu sản phẩm.</div>;
  }

  if (isSingleCheckout && isLoading) {
    return <div className="p-6">Đang tải sản phẩm...</div>;
  }

  if (isSingleCheckout && (!product || !variant)) {
    return <div className="p-6">❌ Không tìm thấy sản phẩm.</div>;
  }

  // ================================
  // 3) TÍNH TỔNG
  // ================================
  const phiShip = 2000;

  let tongTien = 0;

  if (isCartCheckout) {
    tongTien =
      cartItems.reduce(
        (total, it) => total + Number(it.don_gia) * it.so_luong,
        0
      ) + phiShip;
  } else {
    tongTien = Number(variant.gia_ban) * soLuong + phiShip;
  }

  // ================================
  // HÀM LẤY TỒN KHO CHO ITEM TRONG GIỎ (LOCAL)
  // ================================
  const getCartItemStock = (item) => {
    if (!item) return null;

    if (typeof item.ton_kho === "number") return item.ton_kho;
    if (typeof item.so_luong_con_lai === "number") return item.so_luong_con_lai;
    if (typeof item.so_luong_toi_da === "number") return item.so_luong_toi_da;

    if (
      typeof item.so_luong_nhap === "number" &&
      typeof item.so_luong_ban === "number"
    ) {
      return Math.max(0, item.so_luong_nhap - item.so_luong_ban);
    }

    return null; // không có info tồn kho → không check được
  };

  // ================================
  // HÀM ĐIỀU CHỈNH SỐ LƯỢNG TRONG CART (CHECK TỒN KHO)
  // ================================
  const changeCartItemQty = async (item, delta) => {
    const current = item.so_luong;
    let newQty = current + delta;
    if (newQty < 1) newQty = 1;
    if (newQty === current) return;

    // 1) Check tồn kho local từ dữ liệu đã truyền
    const stockLocal = getCartItemStock(item);

    if (stockLocal != null && newQty > stockLocal) {
      alert(
        `Sản phẩm "${item.ten_san_pham}" - ${item.ten_bien_the} chỉ còn ${stockLocal} sản phẩm trong kho.`
      );
      return;
    }

    // 2) Fallback: check server (nếu backend có logic riêng)
    const check = await checkStockOnServer(item.bien_the_san_pham_id, newQty);

    if (!check.ok) {
      alert(
        check.message ||
          `Sản phẩm "${item.ten_san_pham}" - ${item.ten_bien_the} vượt quá số lượng tồn kho.`
      );
      return;
    }

    // 3) OK → cập nhật local state
    setCartItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, so_luong: newQty } : it))
    );
  };

  // ================================
  // SUBMIT (CHECK TỒN KHO + LOGIC ĐỊA CHỈ)
  // ================================
  const handleSubmit = async () => {
    if (
      !form.ten_nguoi_nhan ||
      !form.so_dien_thoai_nguoi_nhan ||
      !form.dia_chi_giao
    ) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    // Check tồn kho single (client-side)
    if (isSingleCheckout && variant) {
      const stock = getVariantStock(variant);
      if (stock != null && soLuong > stock) {
        alert(
          `Sản phẩm chỉ còn ${stock} sản phẩm trong kho, vui lòng giảm số lượng.`
        );
        return;
      }
    }

    // Check tồn kho cart
    if (isCartCheckout) {
      for (const it of cartItems) {
        // 1) Ưu tiên check local
        const stockLocal = getCartItemStock(it);
        if (stockLocal != null && it.so_luong > stockLocal) {
          alert(
            `Sản phẩm "${it.ten_san_pham}" - ${it.ten_bien_the} chỉ còn ${stockLocal} sản phẩm trong kho, vui lòng điều chỉnh lại số lượng.`
          );
          return;
        }

        // 2) (tuỳ chọn) check thêm server
        const check = await checkStockOnServer(
          it.bien_the_san_pham_id,
          it.so_luong
        );
        if (!check.ok) {
          alert(
            check.message ||
              `Sản phẩm "${it.ten_san_pham}" - ${it.ten_bien_the} vượt quá số lượng tồn kho.`
          );
          return;
        }
      }
    }

    let itemsPayload = [];

    if (isCartCheckout) {
      itemsPayload = cartItems.map((it) => ({
        id_bien_the: it.bien_the_san_pham_id,
        so_luong: it.so_luong,
      }));
    } else {
      itemsPayload = [
        {
          id_bien_the: variantId,
          so_luong: soLuong,
        },
      ];
    }

    const baseOrderPayload = {
      ten_nguoi_nhan: form.ten_nguoi_nhan,
      so_dien_thoai_nguoi_nhan: form.so_dien_thoai_nguoi_nhan,
      id_dia_chi: null,
      dia_chi_giao: form.dia_chi_giao,
      phuong_xa: form.phuong_xa,
      tinh_thanh: form.tinh_thanh,
      phuong_thuc_thanh_toan: form.phuong_thuc_thanh_toan,
      phi_van_chuyen: phiShip,
      ghi_chu: form.ghi_chu,
      gio_hang_id: gioHangId,
      url_success: "http://localhost:5173/payment-result/success",
      url_cancel: "http://localhost:5173/payment-result/cancel",
      items: itemsPayload,
    };

    const matchedAddress = addresses.find((addr) => {
      const ten =
        addr.ten_nguoi_nhan || addr.ho_ten || addr.ten || addr.full_name || "";
      const sdt = addr.so_dien_thoai || addr.sdt || addr.phone || "";
      const diaChi = getAddressString(addr);

      return (
        ten.trim() === form.ten_nguoi_nhan.trim() &&
        sdt.trim() === form.so_dien_thoai_nguoi_nhan.trim() &&
        diaChi.trim() === form.dia_chi_giao.trim() &&
        (addr.phuong_xa || "").trim() === (form.phuong_xa || "").trim() &&
        (addr.tinh_thanh || "").trim() === (form.tinh_thanh || "").trim()
      );
    });

    if (matchedAddress) {
      const payload = {
        ...baseOrderPayload,
        id_dia_chi: matchedAddress.id,
      };
      console.log("ORDER PAYLOAD (matched saved address):", payload);
      orderMutation.mutate(payload);
      return;
    }

    const addressPayload = {
      ten_nguoi_nhan: form.ten_nguoi_nhan,
      so_dien_thoai: form.so_dien_thoai_nguoi_nhan,
      dia_chi_cu_the: form.dia_chi_giao,
      phuong_xa: form.phuong_xa,
      tinh_thanh: form.tinh_thanh,
      la_mac_dinh: addresses.length === 0,
    };

    console.log("ADDRESS PAYLOAD (new):", addressPayload);

    createAddressMutation.mutate(addressPayload, {
      onSuccess: (addrRes) => {
        const addrJson = addrRes?.data || addrRes || {};
        const addrId = addrJson.id || addrJson.data?.id || null;

        const payload = {
          ...baseOrderPayload,
          id_dia_chi: addrId,
        };

        console.log("ORDER PAYLOAD (new address):", payload);
        orderMutation.mutate(payload);
      },
      onError: (err) => {
        console.error("❌ Lỗi tạo địa chỉ mới:", err);
        console.log(
          "ORDER PAYLOAD (no address id - fallback):",
          baseOrderPayload
        );
        orderMutation.mutate(baseOrderPayload);
      },
    });
  };

  // ================================
  // UI
  // ================================
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">
              Thanh toán
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Kiểm tra lại sản phẩm và thông tin giao hàng trước khi đặt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[2fr,1.3fr] gap-6 lg:gap-8">
          {/* Cột trái: Sản phẩm + Phương thức thanh toán */}
          <div className="space-y-6">
            {/* Box sản phẩm */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 lg:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Sản phẩm
                </h2>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 font-medium">
                  {isCartCheckout ? `${cartItems.length} sản phẩm` : "Mua ngay"}
                </span>
              </div>

              {/* CHECKOUT TỪ GIỎ HÀNG */}
              {isCartCheckout &&
                cartItems.map((it) => (
                  <div
                    key={it.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-slate-100 pt-3 mt-3"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={it.hinh_anh}
                        className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-100"
                      />
                      <div>
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {it.ten_san_pham}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Biến thể: {it.ten_bien_the}
                        </div>
                        <div className="text-sm font-semibold text-emerald-600 mt-1">
                          {Number(it.don_gia).toLocaleString("vi-VN")}₫
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
                      {/* +/- trong trang thanh toán */}
                      <div className="flex items-center border border-slate-200 rounded-full overflow-hidden bg-slate-50">
                        <button
                          onClick={() => changeCartItemQty(it, -1)}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-semibold">
                          {it.so_luong}
                        </span>
                        <button
                          onClick={() => changeCartItemQty(it, 1)}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-xs text-slate-500">
                        Tạm tính:{" "}
                        <span className="font-semibold text-slate-800">
                          {(Number(it.don_gia) * it.so_luong).toLocaleString(
                            "vi-VN"
                          )}
                          ₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {/* CHECKOUT MUA NGAY (SINGLE) */}
              {!isCartCheckout && isSingleCheckout && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 border-t border-slate-100 pt-3 mt-3">
                  {/* Bên trái: ảnh + thông tin */}
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={product.primaryImage}
                      className="w-16 h-16 rounded-xl object-cover ring-1 ring-slate-100"
                    />
                    <div>
                      <div className="font-medium text-slate-900 line-clamp-1">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Biến thể: {variant.ten_bien_the}
                      </div>
                      <div className="text-sm font-semibold text-emerald-600 mt-1">
                        {Number(variant.gia_ban).toLocaleString("vi-VN")}₫
                      </div>
                    </div>
                  </div>

                  {/* Bên phải: nút +/- + tạm tính (giống giỏ hàng) */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
                    <div className="flex items-center border border-slate-200 rounded-full overflow-hidden bg-slate-50">
                      <button
                        onClick={() => setSoLuong((v) => Math.max(1, v - 1))}
                        className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">
                        {soLuong}
                      </span>
                      <button
                        onClick={() => {
                          const stock = getVariantStock(variant);
                          setSoLuong((v) => {
                            const newQty = v + 1;
                            if (stock != null && newQty > stock) {
                              alert(
                                `Sản phẩm chỉ còn ${stock} sản phẩm trong kho.`
                              );
                              return v;
                            }
                            return newQty;
                          });
                        }}
                        className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-xs text-slate-500">
                      Tạm tính:{" "}
                      <span className="font-semibold text-slate-800">
                        {(Number(variant.gia_ban) * soLuong).toLocaleString(
                          "vi-VN"
                        )}
                        ₫
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Box phương thức thanh toán */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 lg:p-5 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Phương thức thanh toán
              </h2>

              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-500 transition cursor-pointer bg-slate-50/60">
                  <input
                    type="radio"
                    name="pm"
                    className="w-4 h-4 accent-emerald-600"
                    checked={form.phuong_thuc_thanh_toan === "cod"}
                    onChange={() =>
                      setForm((f) => ({
                        ...f,
                        phuong_thuc_thanh_toan: "cod",
                      }))
                    }
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Thanh toán khi nhận hàng (COD)
                    </div>
                    <p className="text-xs text-slate-500">
                      Bạn sẽ thanh toán tiền mặt cho shipper khi nhận hàng.
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-emerald-500 transition cursor-pointer">
                  <input
                    type="radio"
                    name="pm"
                    className="w-4 h-4 accent-emerald-600"
                    checked={form.phuong_thuc_thanh_toan === "payos_qr"}
                    onChange={() =>
                      setForm((f) => ({
                        ...f,
                        phuong_thuc_thanh_toan: "payos_qr",
                      }))
                    }
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Thanh toán online qua QR PayOS
                    </div>
                    <p className="text-xs text-slate-500">
                      Hỗ trợ quét mã QR bằng ứng dụng ngân hàng / ví điện tử.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin giao hàng + Tổng tiền */}
          <div className="space-y-6">
            {/* Box thông tin giao hàng */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 lg:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Thông tin giao hàng
                </h2>
              </div>

              {/* DROPDOWN ĐỊA CHỈ */}
              {addresses.length > 0 && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-slate-600">
                    Địa chỉ lưu sẵn
                  </label>
                  <select
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={String(addr.id)}>
                        {(addr.ten_nguoi_nhan || addr.ho_ten || "Không tên") +
                          " - " +
                          getAddressString(addr)}
                      </option>
                    ))}
                    <option value="new">+ Thêm địa chỉ mới</option>
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Bạn có thể chỉnh sửa bên dưới. Nếu khác với địa chỉ đã lưu,
                    hệ thống sẽ tự tạo địa chỉ mới.
                  </p>
                </div>
              )}

              {/* Ô nhập thông tin */}
              <div className="space-y-3 mt-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Tên người nhận
                  </label>
                  <input
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    name="ten_nguoi_nhan"
                    placeholder="VD: Nguyễn Văn A"
                    value={form.ten_nguoi_nhan}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Số điện thoại
                  </label>
                  <input
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    name="so_dien_thoai_nguoi_nhan"
                    placeholder="VD: 09xx xxx xxx"
                    value={form.so_dien_thoai_nguoi_nhan}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Số nhà và tên đường
                  </label>
                  <input
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    name="dia_chi_giao"
                    placeholder="Số nhà, tên đường..."
                    value={form.dia_chi_giao}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">
                      Phường / Xã
                    </label>
                    <input
                      className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      name="phuong_xa"
                      placeholder="VD: Mỹ Thới"
                      value={form.phuong_xa}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-600">
                      Tỉnh / Thành phố
                    </label>
                    <input
                      className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      name="tinh_thanh"
                      placeholder="VD: An Giang"
                      value={form.tinh_thanh}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">
                    Ghi chú (không bắt buộc)
                  </label>
                  <textarea
                    className="w-full bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    name="ghi_chu"
                    placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
                    value={form.ghi_chu}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Box tổng kết + nút đặt hàng */}
            <div className="bg-slate-900 text-slate-50 rounded-2xl p-4 lg:p-5 space-y-4 shadow-md">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
                Tóm tắt đơn hàng
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-300">Tạm tính</span>
                  <span className="font-medium text-slate-50">
                    {(tongTien - phiShip).toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Phí vận chuyển</span>
                  <span className="font-medium text-slate-50">
                    {phiShip.toLocaleString("vi-VN")}₫
                  </span>
                </div>
                <div className="border-t border-slate-700 my-2" />
                <div className="flex justify-between items-center text-base">
                  <span className="font-semibold">Tổng thanh toán</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {tongTien.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_14px_40px_rgba(16,185,129,0.45)]"
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                Bằng việc tiếp tục, bạn đồng ý với các điều khoản mua hàng của
                Camera Shop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
