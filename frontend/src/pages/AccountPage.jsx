// frontend/src/pages/AccountPage.jsx

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { User, MapPin, History, Star, Save, Plus } from "lucide-react";

import { layThongTinCaNhan, capNhatThongTin } from "../api/userApi";

import { useMyReviews, useDeleteReview } from "../hooks/useReviews";

import {
  layDanhSachDiaChi,
  taoDiaChi,
  capNhatDiaChi,
  xoaDiaChi,
  datMacDinh,
} from "../api/addressApi";

// 🔹 Hook đơn hàng
import {
  useCustomerOrderList,
  useCancelCustomerOrder,
  useReturnCustomerOrder,
} from "../hooks/useCustomerOrders";

import { taoDanhGia } from "../api/reviewApi";
import ReviewForm from "../components/review/ReviewForm";

// 🔹 Component đơn hàng
import OrderCard from "../components/common/orders/OrderCard";
import OrderStatusBadge from "../components/common/orders/OrderStatusBadge";
import CancelOrderModal from "../components/common/orders/CancelOrderModal";
import ReturnRequestModal from "../components/common/orders/ReturnRequestModal";

// ====== Helper cho tiền & tổng ======
const fmtVND = (n) => Number(n || 0).toLocaleString("vi-VN") + "₫";

const calcProductTotal = (order) =>
  (order?.items || []).reduce((s, i) => s + i.so_luong * i.don_gia_luc_mua, 0);

const getShippingFee = (order) =>
  Number(
    order?.phi_van_chuyen ??
      order?.phi_ship ??
      order?.tien_ship ??
      order?.phi_ship_van_chuyen ??
      0
  ) || 0;

const calcGrandTotal = (order) =>
  calcProductTotal(order) + getShippingFee(order);

const canCancel = (status) => ["cho_xac_nhan", "da_xac_nhan"].includes(status);
const canRequestReturn = (status) => status === "da_giao";

export default function AccountPage() {
  const authUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("orders"); // cho tiện test
  const [selectedOrder, setSelectedOrder] = useState(null);

  // PROFILE
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  // ADDRESS
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditAddress, setIsEditAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    id: null,
    ten_nguoi_nhan: "",
    so_dien_thoai: "",
    dia_chi_cu_the: "",
    phuong_xa: "",
    tinh_thanh: "",
    ma_buu_dien: "",
    la_mac_dinh: false,
  });

  // ORDERS
  const {
    data: orders = [],
    isLoading: loadingOrders,
    isError: orderError,
    error: orderErrorObj,
  } = useCustomerOrderList();

  const cancelOrderMutation = useCancelCustomerOrder();
  const returnOrderMutation = useReturnCustomerOrder();

  const [cancelTarget, setCancelTarget] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);

  const handleOpenCancel = (order) => setCancelTarget(order);
  const handleOpenReturn = (order) => setReturnTarget(order);

  const handleConfirmCancel = async (reason) => {
    if (!cancelTarget) return;
    try {
      await cancelOrderMutation.mutateAsync({
        id: cancelTarget.id,
        ly_do: reason,
      });
      alert("Huỷ đơn hàng thành công");
      setCancelTarget(null);
      if (selectedOrder && selectedOrder.id === cancelTarget.id) {
        setSelectedOrder({
          ...selectedOrder,
          trang_thai: "da_huy",
        });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        "Không thể huỷ đơn hàng. Vui lòng thử lại.";
      alert(msg);
      console.error(err);
    }
  };

  const handleConfirmReturn = async (reason) => {
    if (!returnTarget) return;
    try {
      await returnOrderMutation.mutateAsync({
        id: returnTarget.id,
        ly_do: reason,
      });
      alert("Gửi yêu cầu đổi/trả thành công");
      setReturnTarget(null);
      if (selectedOrder && selectedOrder.id === returnTarget.id) {
        setSelectedOrder({
          ...selectedOrder,
          trang_thai: "yeu_cau_doi_tra",
        });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.error ||
        "Không thể gửi yêu cầu đổi/trả. Vui lòng thử lại.";
      alert(msg);
      console.error(err);
    }
  };

  // REVIEWS (của tôi)
  const [reviewPage, setReviewPage] = useState(1);

  const {
    data: myReviewsRes,
    isLoading: loadingMyReviews,
    isError: myReviewsError,
    error: myReviewsErrorObj,
  } = useMyReviews({
    page: reviewPage,
    per_page: 5,
  });

  const myReviews = myReviewsRes?.data || [];
  const myReviewsPagination = myReviewsRes?.pagination || {
    page: 1,
    per_page: 5,
    total: 0,
    pages: 1,
  };

  const deleteReviewMutation = useDeleteReview();
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  const handleOpenProductFromReview = (rv) => {
    const productId = rv?.san_pham?.id || rv?.san_pham_id;
    if (!productId) return;
    navigate(`/products/${productId}`);
  };

  const handleDeleteReviewClick = async (rv) => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;
    try {
      setDeletingReviewId(rv.id);
      await deleteReviewMutation.mutateAsync(rv.id);
      alert("Đã xóa đánh giá.");
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review-stats"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Không thể xóa đánh giá. Vui lòng thử lại.";
      alert(msg);
      console.error(err);
    } finally {
      setDeletingReviewId(null);
    }
  };

  // ===== TẠO ĐÁNH GIÁ TỪ ĐƠN ĐÃ GIAO =====
  const [reviewTarget, setReviewTarget] = useState(null); // {order, item}

  const reviewMutation = useMutation({
    mutationFn: ({ chi_tiet_don_hang_id, diem_danh_gia, binh_luan }) =>
      taoDanhGia({ chi_tiet_don_hang_id, diem_danh_gia, binh_luan }),
    onSuccess: () => {
      alert("Đã gửi đánh giá, cảm ơn bạn!");
      setReviewTarget(null);
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review-stats"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
    onError: (err) => {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Không thể gửi đánh giá. Vui lòng thử lại.";
      alert(msg);
      console.error(err);
    },
  });

  const handleOpenReview = (order, item) => {
    if (order.trang_thai !== "da_giao") {
      alert("Chỉ có thể đánh giá các sản phẩm thuộc đơn hàng đã giao.");
      return;
    }
    setReviewTarget({ order, item });
  };

  const handleSubmitReviewFromOrder = (values) => {
    if (!reviewTarget?.item?.id) return;
    reviewMutation.mutate({
      chi_tiet_don_hang_id: reviewTarget.item.id,
      diem_danh_gia: values.diem_danh_gia,
      binh_luan: values.binh_luan,
    });
  };

  // 🔸 Review từ nút ngoài trên OrderCard (chọn sản phẩm chưa đánh giá đầu tiên)
  const handleOpenReviewFromCard = (order) => {
    if (order.trang_thai !== "da_giao") return;

    const items = order.items || [];
    const firstNotReviewed = items.find((item) => {
      const reviewed =
        item.da_danh_gia ||
        item.co_danh_gia ||
        item.danh_gia_id ||
        item.review_id;
      return !reviewed;
    });

    if (!firstNotReviewed) {
      alert("Tất cả sản phẩm trong đơn này đã được đánh giá.");
      return;
    }

    setReviewTarget({ order, item: firstNotReviewed });
  };

  // PROFILE load
  useEffect(() => {
    async function load() {
      try {
        const profiledata = await layThongTinCaNhan();
        setProfile(profiledata);
        setProfileForm({
          ho_ten: profiledata.ho_ten || "",
          email: profiledata.email || "",
          so_dien_thoai: profiledata.so_dien_thoai || "",
        });
      } catch (err) {
        console.error("Load profile failed", err);
      } finally {
        setLoadingProfile(false);
      }
    }
    load();
  }, []);

  // ADDRESS load
  const refreshAddresses = async () => {
    try {
      const res = await layDanhSachDiaChi();
      setAddresses(res.data ?? []);
    } catch (err) {
      console.error("Load address failed:", err);
      setAddresses([]);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    refreshAddresses();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const updated = await capNhatThongTin({
        ho_ten: profileForm.ho_ten,
        so_dien_thoai: profileForm.so_dien_thoai,
      });

      setProfile(updated);
      setEditMode(false);
      alert("Cập nhật thành công!");
    } catch (err) {
      alert("Lỗi cập nhật thông tin: email/SĐT có thể đã được sử dụng!");
      console.error(err);
    }
  };

  // ADDRESS handlers
  const handleOpenAddAddress = () => {
    setIsEditAddress(false);
    setAddressForm({
      id: null,
      ten_nguoi_nhan: profile?.ho_ten || "",
      so_dien_thoai: profile?.so_dien_thoai || "",
      dia_chi_cu_the: "",
      phuong_xa: "",
      tinh_thanh: "",
      ma_buu_dien: "",
      la_mac_dinh: addresses.length === 0,
    });
    setShowAddressForm(true);
  };

  const handleEditAddress = (a) => {
    setIsEditAddress(true);
    setAddressForm({
      id: a.id,
      ten_nguoi_nhan: a.ten_nguoi_nhan,
      so_dien_thoai: a.so_dien_thoai,
      dia_chi_cu_the: a.dia_chi_cu_the,
      phuong_xa: a.phuong_xa,
      tinh_thanh: a.tinh_thanh,
      ma_buu_dien: a.ma_buu_dien,
      la_mac_dinh: a.la_mac_dinh,
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!confirm("Xóa địa chỉ này?")) return;

    try {
      await xoaDiaChi(id);
      refreshAddresses();
    } catch (err) {
      alert("Không thể xóa (có thể là địa chỉ mặc định)!");
      console.error(err);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await datMacDinh(id);
      refreshAddresses();
    } catch (err) {
      alert("Không thể đặt mặc định!");
      console.error(err);
    }
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();

    const data = { ...addressForm };

    try {
      if (isEditAddress) {
        await capNhatDiaChi(addressForm.id, data);
      } else {
        await taoDiaChi(data);
      }
      setShowAddressForm(false);
      refreshAddresses();
    } catch (err) {
      alert("Lỗi lưu địa chỉ!");
      console.error(err);
    }
  };

  // ====================== RENDER ======================
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e9fff5] to-[#d2f5eb] py-10">
      <div className="container mx-auto px-4">
        {/* Khối kính tổng */}
        <div className="bg-white/10 border border-white/50 rounded-[32px] shadow-[0_18px_55px_rgba(15,118,110,0.25)] backdrop-blur-2xl px-5 py-6 md:px-8 md:py-8">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                Quản lý tài khoản
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-700 text-xs px-2 py-1 border border-emerald-200">
                  WebCameraShop
                </span>
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Xin chào,{" "}
                <span className="font-semibold text-emerald-700">
                  {profileForm.ho_ten || authUser?.email}
                </span>{" "}
                👋 – quản lý thông tin cá nhân, địa chỉ, đơn hàng và đánh giá
                của bạn tại đây.
              </p>
            </div>
          </div>

          {/* Layout chính */}
          <div className="grid grid-cols-12 gap-6 mt-6">
            {/* SIDEBAR */}
            <aside className="col-span-12 md:col-span-3">
              <div className="bg-white/40 border border-white/70 rounded-3xl shadow-lg backdrop-blur-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-slate-500 mb-1">
                  BẢNG ĐIỀU HƯỚNG
                </p>
                <MenuButton
                  active={activeTab === "profile"}
                  onClick={() => {
                    setActiveTab("profile");
                    setSelectedOrder(null);
                  }}
                  icon={<User size={16} />}
                  label="Thông tin cá nhân"
                />
                <MenuButton
                  active={activeTab === "address"}
                  onClick={() => {
                    setActiveTab("address");
                    setSelectedOrder(null);
                  }}
                  icon={<MapPin size={16} />}
                  label="Địa chỉ giao hàng"
                />
                <MenuButton
                  active={activeTab === "orders"}
                  onClick={() => {
                    setActiveTab("orders");
                    setSelectedOrder(null);
                  }}
                  icon={<History size={16} />}
                  label="Đơn hàng của tôi"
                />
                <MenuButton
                  active={activeTab === "reviews"}
                  onClick={() => {
                    setActiveTab("reviews");
                    setSelectedOrder(null);
                  }}
                  icon={<Star size={16} />}
                  label="Đánh giá sản phẩm"
                />
              </div>
            </aside>

            {/* CONTENT */}
            <div className="col-span-12 md:col-span-9 space-y-6">
              {/* PROFILE */}
              {activeTab === "profile" && (
                <section className="bg-white/75 border border-white/80 rounded-3xl shadow-md backdrop-blur-xl p-5 md:p-6">
                  <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <User size={16} />
                    </span>
                    Thông tin cá nhân
                  </h2>

                  {loadingProfile ? (
                    <p className="text-sm text-slate-500">Đang tải...</p>
                  ) : !editMode ? (
                    <div className="space-y-3">
                      <InfoRow label="Họ tên" value={profile?.ho_ten} />
                      <InfoRow label="Email" value={profile?.email} />
                      <InfoRow
                        label="Số điện thoại"
                        value={profile?.so_dien_thoai}
                      />

                      <button
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-md transition"
                        onClick={() => setEditMode(true)}
                      >
                        <Save size={16} /> Sửa thông tin
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSaveProfile}
                      className="space-y-4 max-w-xl"
                    >
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Họ tên
                        </label>
                        <input
                          className="ui-input w-full bg-white/80 border-slate-200 focus:border-emerald-500 focus:ring-emerald-400"
                          value={profileForm.ho_ten}
                          onChange={(e) =>
                            setProfileForm((p) => ({
                              ...p,
                              ho_ten: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Email (không thể sửa)
                        </label>
                        <input
                          className="ui-input w-full bg-slate-50 border-dashed border-slate-200 cursor-not-allowed"
                          value={profileForm.email}
                          readOnly
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          className="ui-input w-full bg-white/80 border-slate-200 focus:border-emerald-500 focus:ring-emerald-400"
                          value={profileForm.so_dien_thoai}
                          onChange={(e) =>
                            setProfileForm((p) => ({
                              ...p,
                              so_dien_thoai: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex flex-wrap gap-3 pt-1">
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-md transition"
                          type="submit"
                        >
                          <Save size={16} /> Lưu thay đổi
                        </button>

                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50 bg-white/70"
                          onClick={() => setEditMode(false)}
                        >
                          Hủy
                        </button>
                      </div>
                    </form>
                  )}
                </section>
              )}

              {/* ADDRESS */}
              {activeTab === "address" && (
                <section className="bg-white/75 border border-white/80 rounded-3xl shadow-md backdrop-blur-xl p-5 md:p-6">
                  <div className="flex justify-between items-center mb-4 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                        <MapPin size={16} />
                      </span>
                      <h2 className="text-lg md:text-xl font-semibold">
                        Địa chỉ giao hàng
                      </h2>
                    </div>
                    <button
                      className="px-3 py-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-600 text-white text-xs md:text-sm flex items-center gap-1 shadow-md transition"
                      onClick={handleOpenAddAddress}
                    >
                      <Plus size={14} /> Thêm địa chỉ
                    </button>
                  </div>

                  {showAddressForm && (
                    <form
                      onSubmit={handleSubmitAddress}
                      className="p-4 mb-5 bg-white/80 rounded-2xl border border-emerald-50 shadow-sm space-y-3"
                    >
                      <h3 className="font-semibold text-sm text-slate-800">
                        {isEditAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          placeholder="Tên người nhận"
                          className="ui-input bg-white/90 border-slate-200 focus:border-emerald-500 focus:ring-emerald-400"
                          value={addressForm.ten_nguoi_nhan}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              ten_nguoi_nhan: e.target.value,
                            })
                          }
                        />
                        <input
                          placeholder="Số điện thoại"
                          className="ui-input bg-white/90 border-slate-200 focus:border-emerald-500 focus:ring-emerald-400"
                          value={addressForm.so_dien_thoai}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              so_dien_thoai: e.target.value,
                            })
                          }
                        />

                        <input
                          placeholder="Số nhà và tên đường"
                          className="ui-input bg-white/90 border-slate-200 focus:border-emerald-500 focus:ring-emerald-400 md:col-span-2"
                          value={addressForm.dia_chi_cu_the}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              dia_chi_cu_the: e.target.value,
                            })
                          }
                        />

                        <input
                          placeholder="Phường/Xã"
                          className="ui-input bg-white/90 border-slate-200 focus:border-emerald-500 focus:ring-emerald-400"
                          value={addressForm.phuong_xa}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              phuong_xa: e.target.value,
                            })
                          }
                        />
                        <input
                          placeholder="Tỉnh/Thành phố"
                          className="ui-input bg-white/90 border-slate-200 focus:border-emerald-500 focus:ring-emerald-400"
                          value={addressForm.tinh_thanh}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              tinh_thanh: e.target.value,
                            })
                          }
                        />

                        <input
                          placeholder="Mã bưu điện"
                          className="ui-input bg-white/90 border-slate-200 focus:border-emerald-500 focus:ring-emerald-400"
                          value={addressForm.ma_buu_dien}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              ma_buu_dien: e.target.value,
                            })
                          }
                        />
                      </div>

                      <label className="flex items-center gap-2 text-xs text-slate-700">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          checked={addressForm.la_mac_dinh}
                          onChange={(e) =>
                            setAddressForm({
                              ...addressForm,
                              la_mac_dinh: e.target.checked,
                            })
                          }
                        />
                        Đặt làm địa chỉ mặc định
                      </label>

                      <button className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm shadow-md transition">
                        {isEditAddress ? "Lưu địa chỉ" : "Thêm địa chỉ"}
                      </button>
                    </form>
                  )}

                  {loadingAddresses ? (
                    <p className="text-sm text-slate-500">Đang tải...</p>
                  ) : addresses.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Bạn chưa có địa chỉ nào. Hãy thêm địa chỉ để thanh toán
                      nhanh hơn.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((a) => (
                        <div
                          key={a.id}
                          className="p-4 rounded-2xl bg-white/90 shadow-sm border border-slate-100 hover:shadow-md hover:border-emerald-200 transition space-y-2"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-semibold text-sm text-slate-900">
                              {a.ten_nguoi_nhan}
                            </p>
                            {a.la_mac_dinh && (
                              <span className="text-[10px] uppercase tracking-wide px-2 py-1 bg-emerald-500/10 text-emerald-700 rounded-full border border-emerald-200">
                                Mặc định
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-500">
                            SĐT: {a.so_dien_thoai}
                          </p>
                          <p className="text-sm text-slate-700">
                            {[a.dia_chi_cu_the, a.phuong_xa, a.tinh_thanh]
                              .filter(Boolean)
                              .join(", ")}
                          </p>

                          <div className="flex flex-wrap gap-3 text-[11px] mt-3">
                            <button
                              className="text-emerald-600 hover:underline"
                              onClick={() => handleEditAddress(a)}
                            >
                              Sửa
                            </button>
                            <button
                              className="text-red-500 hover:underline"
                              onClick={() => handleDeleteAddress(a.id)}
                            >
                              Xóa
                            </button>
                            {!a.la_mac_dinh && (
                              <button
                                className="text-emerald-600 hover:underline"
                                onClick={() => handleSetDefault(a.id)}
                              >
                                Đặt làm mặc định
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ORDERS */}
              {activeTab === "orders" && (
                <section className="bg-white/75 border border-white/80 rounded-3xl shadow-md backdrop-blur-xl p-5 md:p-6">
                  {!selectedOrder ? (
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                          <History size={16} />
                        </span>
                        <h2 className="text-lg md:text-xl font-semibold">
                          Đơn hàng của tôi
                        </h2>
                      </div>

                      {loadingOrders ? (
                        <p className="text-sm text-slate-500">Đang tải...</p>
                      ) : orderError ? (
                        <p className="text-red-500 text-sm">
                          Không thể tải đơn hàng:{" "}
                          {orderErrorObj?.message || "Lỗi không xác định"}
                        </p>
                      ) : orders.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          Bạn chưa có đơn hàng nào. Hãy khám phá những sản phẩm
                          nổi bật trên trang chủ nhé!
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {orders.map((od) => (
                            <OrderCard
                              key={od.id}
                              order={od}
                              onClick={() => setSelectedOrder(od)}
                              onCancel={handleOpenCancel}
                              onRequestReturn={handleOpenReturn}
                              onReview={handleOpenReviewFromCard}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4 gap-3">
                        <div>
                          <h2 className="text-lg md:text-xl font-semibold">
                            Chi tiết đơn hàng #{selectedOrder.ma_don_hang}
                          </h2>
                          <p className="text-xs text-slate-500 mt-1">
                            Ngày đặt:{" "}
                            {selectedOrder.ngay_tao
                              ? new Date(selectedOrder.ngay_tao).toLocaleString(
                                  "vi-VN"
                                )
                              : "-"}
                          </p>
                        </div>
                        <button
                          className="text-xs md:text-sm text-emerald-600 hover:underline"
                          onClick={() => setSelectedOrder(null)}
                        >
                          ← Quay lại danh sách
                        </button>
                      </div>

                      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-600">Trạng thái:</span>
                          <OrderStatusBadge
                            trang_thai={selectedOrder.trang_thai}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {canCancel(selectedOrder.trang_thai) && (
                            <button
                              className="px-3 py-1 rounded-full border border-red-300 text-red-600 hover:bg-red-50 bg-white/80"
                              onClick={() => handleOpenCancel(selectedOrder)}
                            >
                              Huỷ đơn
                            </button>
                          )}
                          {canRequestReturn(selectedOrder.trang_thai) && (
                            <button
                              className="px-3 py-1 rounded-full border border-amber-300 text-amber-700 hover:bg-amber-50 bg-white/80"
                              onClick={() => handleOpenReturn(selectedOrder)}
                            >
                              Yêu cầu đổi/trả
                            </button>
                          )}
                        </div>
                      </div>

                      {/* DANH SÁCH SẢN PHẨM TRONG ĐƠN */}
                      <div className="border border-slate-100 rounded-2xl p-4 mb-4 bg-white/90">
                        <h3 className="font-semibold mb-3 text-sm text-slate-900">
                          Sản phẩm trong đơn
                        </h3>
                        <div className="divide-y divide-slate-100">
                          {(selectedOrder.items || []).map((item) => {
                            const reviewed =
                              item.da_danh_gia ||
                              item.co_danh_gia ||
                              item.danh_gia_id ||
                              item.review_id;

                            return (
                              <div
                                key={
                                  item.id ||
                                  `${item.bien_the_san_pham_id}-${item.ten_san_pham_luc_mua}`
                                }
                                className="py-3 flex justify-between text-sm gap-4"
                              >
                                <div className="max-w-[70%]">
                                  <p className="font-medium text-slate-900">
                                    {item.ten_san_pham_luc_mua}
                                  </p>
                                  {item.ten_bien_the_luc_mua && (
                                    <p className="text-xs text-slate-500">
                                      {item.ten_bien_the_luc_mua}
                                    </p>
                                  )}
                                  <p className="text-xs text-slate-500">
                                    Số lượng: {item.so_luong}
                                  </p>

                                  {selectedOrder.trang_thai === "da_giao" && (
                                    <div className="mt-1">
                                      {reviewed ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          Đã đánh giá
                                        </span>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenReview(
                                              selectedOrder,
                                              item
                                            )
                                          }
                                          className="text-xs text-emerald-600 hover:underline"
                                        >
                                          Đánh giá sản phẩm
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-500">
                                    Đơn giá: {fmtVND(item.don_gia_luc_mua || 0)}
                                  </p>
                                  <p className="font-semibold text-slate-900">
                                    {fmtVND(
                                      (item.so_luong || 0) *
                                        (item.don_gia_luc_mua || 0)
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* TỔNG TIỀN */}
                      <div className="border border-emerald-100 rounded-2xl p-4 max-w-md ml-auto bg-emerald-50/60">
                        <h3 className="font-semibold mb-3 text-sm text-emerald-800">
                          Tổng thanh toán
                        </h3>
                        <div className="space-y-1 text-sm text-slate-800">
                          <div className="flex justify-between">
                            <span>Tạm tính sản phẩm</span>
                            <span>
                              {fmtVND(calcProductTotal(selectedOrder))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Phí vận chuyển</span>
                            <span>{fmtVND(getShippingFee(selectedOrder))}</span>
                          </div>
                          <hr className="my-2 border-emerald-100" />
                          <div className="flex justify-between font-bold text-base text-emerald-800">
                            <span>Thành tiền</span>
                            <span>{fmtVND(calcGrandTotal(selectedOrder))}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </section>
              )}

              {/* REVIEWS TAB */}
              {activeTab === "reviews" && (
                <section className="bg-white/75 border border-white/80 rounded-3xl shadow-md backdrop-blur-xl p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                      <Star size={16} />
                    </span>
                    <h2 className="text-lg md:text-xl font-semibold">
                      Đánh giá sản phẩm
                    </h2>
                  </div>

                  {loadingMyReviews ? (
                    <p className="text-sm text-slate-500">
                      Đang tải danh sách đánh giá...
                    </p>
                  ) : myReviewsError ? (
                    <p className="text-sm text-red-500">
                      Không tải được đánh giá:{" "}
                      {myReviewsErrorObj?.message || "Lỗi không xác định"}
                    </p>
                  ) : myReviews.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Bạn chưa có đánh giá nào. Hãy đánh giá các sản phẩm đã mua
                      để nhận ưu đãi tốt hơn nhé!
                    </p>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {myReviews.map((rv) => {
                          const productName =
                            rv.san_pham?.ten_san_pham ||
                            rv.ten_san_pham ||
                            `Sản phẩm #${rv.san_pham_id}`;

                          const productId = rv.san_pham?.id || rv.san_pham_id;

                          return (
                            <div
                              key={rv.id}
                              className="border border-slate-100 rounded-2xl p-4 flex flex-col gap-2 bg-white/90 shadow-sm hover:shadow-md transition"
                            >
                              <div className="flex justify-between gap-3">
                                <div className="flex-1">
                                  <button
                                    type="button"
                                    className="text-sm font-semibold text-emerald-700 hover:underline"
                                    onClick={() =>
                                      handleOpenProductFromReview(rv)
                                    }
                                  >
                                    {productName}
                                  </button>

                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    ID SP: {productId}
                                  </p>

                                  <div className="flex items-center gap-2 mt-1">
                                    <MiniStarRow value={rv.diem_danh_gia} />
                                    <span className="text-xs text-slate-500">
                                      {rv.diem_danh_gia} / 5
                                    </span>
                                    {rv.trang_thai && (
                                      <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                        {rv.trang_thai === "da_duyet"
                                          ? "Đã duyệt"
                                          : rv.trang_thai === "bi_tu_choi"
                                          ? "Bị từ chối"
                                          : "Chờ duyệt"}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right text-[11px] text-slate-400">
                                  {rv.ngay_tao &&
                                    new Date(rv.ngay_tao).toLocaleString(
                                      "vi-VN"
                                    )}
                                </div>
                              </div>

                              {rv.binh_luan && (
                                <p className="text-sm text-slate-700">
                                  {rv.binh_luan}
                                </p>
                              )}

                              <div className="flex gap-3 text-xs mt-2">
                                <button
                                  type="button"
                                  className="text-emerald-600 hover:underline"
                                  onClick={() =>
                                    handleOpenProductFromReview(rv)
                                  }
                                >
                                  Xem sản phẩm
                                </button>
                                <button
                                  type="button"
                                  className="text-red-500 hover:underline"
                                  onClick={() => handleDeleteReviewClick(rv)}
                                  disabled={deletingReviewId === rv.id}
                                >
                                  {deletingReviewId === rv.id
                                    ? "Đang xóa..."
                                    : "Xóa đánh giá"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {myReviewsPagination.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                          {Array.from({
                            length: myReviewsPagination.pages,
                          }).map((_, idx) => {
                            const current = idx + 1;
                            const active = current === reviewPage;
                            return (
                              <button
                                key={current}
                                onClick={() => setReviewPage(current)}
                                className={`px-3 py-1 rounded-xl text-xs transition ${
                                  active
                                    ? "bg-emerald-600 text-white shadow-md"
                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                              >
                                {current}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal huỷ đơn */}
      <CancelOrderModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        loading={cancelOrderMutation.isLoading}
        order={cancelTarget}
      />

      {/* Modal đổi/trả */}
      <ReturnRequestModal
        open={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        onConfirm={handleConfirmReturn}
        loading={returnOrderMutation.isLoading}
        order={returnTarget}
      />

      {/* Modal đánh giá sản phẩm */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-md p-5 border border-white/80">
            <h3 className="text-base font-semibold mb-2 text-slate-900">
              Đánh giá sản phẩm đã mua
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Đơn hàng #{reviewTarget.order.ma_don_hang} •{" "}
              {reviewTarget.item.ten_san_pham_luc_mua}
              {reviewTarget.item.ten_bien_the_luc_mua &&
                ` (${reviewTarget.item.ten_bien_the_luc_mua})`}
            </p>

            <ReviewForm
              onSubmit={handleSubmitReviewFromOrder}
              submitting={reviewMutation.isLoading}
            />

            <div className="flex justify-end mt-3">
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                disabled={reviewMutation.isLoading}
                className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== COMPONENT PHỤ =====

function MenuButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl mb-2 text-[15px] border transition shadow-sm
      ${
        active
          ? "bg-emerald-500/15 border-emerald-400/60 text-emerald-800 shadow-md"
          : "bg-white/70 border-transparent text-slate-700 hover:border-slate-200 hover:bg-white hover:shadow-md"
      }`}
    >
      <span className="text-emerald-600">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col text-sm">
      <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-slate-900 mt-0.5">{value || "—"}</span>
    </div>
  );
}

function MiniStarRow({ value = 0 }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="inline-flex items-center gap-0.5">
      {stars.map((i) => (
        <svg
          key={i}
          xmlns="http://www.w3.org/2000/svg"
          width={14}
          height={14}
          viewBox="0 0 24 24"
          className={
            i <= value ? "fill-amber-400" : "fill-gray-300 dark:fill-slate-600"
          }
        >
          <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.401 8.168L12 18.896l-7.335 3.869 1.401-8.168L.132 9.21l8.2-1.192z" />
        </svg>
      ))}
    </div>
  );
}
