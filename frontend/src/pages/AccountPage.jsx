// frontend/src/pages/AccountPage.jsx

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

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

// -------------------------------------------------------
// COMPONENT CHÍNH
// -------------------------------------------------------
export default function AccountPage() {
  const authUser = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");

  // =====================
  // PROFILE
  // =====================
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    ho_ten: "",
    email: "",
    so_dien_thoai: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(true);

  // =====================
  // ADDRESS
  // =====================
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

  // =====================
  // ORDERS (React Query)
  // =====================
  const {
    data: orders = [],
    isLoading: loadingOrders,
    isError: orderError,
    error: orderErrorObj,
  } = useCustomerOrderList();

  const cancelOrderMutation = useCancelCustomerOrder();
  const returnOrderMutation = useReturnCustomerOrder();

  // chọn đơn để xem chi tiết (null = xem danh sách)
  const [selectedOrder, setSelectedOrder] = useState(null);

  // state cho modal
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

  // =====================
  // REVIEWS (ĐÁNH GIÁ CỦA TÔI)
  // =====================
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

  // mở trang chi tiết sản phẩm từ 1 review
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

  // =====================
  // LOAD PROFILE
  // =====================
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

  // =====================
  // LOAD ADDRESS
  // =====================
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

  // =============================================================
  // 📌 LƯU PROFILE
  // =============================================================
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

  // =============================================================
  // 📌 ADDRESS HANDLERS
  // =============================================================
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

  // -------------------------------------------------------
  // RENDER
  // -------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50 py-6">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
        <p className="text-sm text-slate-500">
          Xin chào, {profileForm.ho_ten || authUser?.email} 👋
        </p>

        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* SIDEBAR */}
          <aside className="col-span-12 md:col-span-3">
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
          </aside>

          {/* CONTENT */}
          <div className="col-span-12 md:col-span-9">
            {/* ================= PROFILE ================= */}
            {activeTab === "profile" && (
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h2 className="text-lg font-bold mb-4">Thông tin cá nhân</h2>

                {loadingProfile ? (
                  <p>Đang tải...</p>
                ) : !editMode ? (
                  <div className="space-y-2">
                    <p>
                      <b>Họ tên:</b> {profile?.ho_ten}
                    </p>
                    <p>
                      <b>Email:</b> {profile?.email}
                    </p>
                    <p>
                      <b>Số điện thoại:</b> {profile?.so_dien_thoai}
                    </p>

                    <button
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
                      onClick={() => setEditMode(true)}
                    >
                      Sửa thông tin
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div>
                      <label>Họ tên</label>
                      <input
                        className="ui-input w-full"
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
                      <label>Email (không thể sửa)</label>
                      <input
                        className="ui-input w-full"
                        value={profileForm.email}
                        readOnly
                      />
                    </div>

                    <div>
                      <label>Số điện thoại</label>
                      <input
                        className="ui-input w-full"
                        value={profileForm.so_dien_thoai}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            so_dien_thoai: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="flex gap-3">
                      <button className="btn-emerald px-4 py-2 flex items-center gap-2">
                        <Save size={16} /> Lưu thay đổi
                      </button>

                      <button
                        type="button"
                        className="px-4 py-2 rounded-lg border"
                        onClick={() => setEditMode(false)}
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ================= ADDRESS ================= */}
            {activeTab === "address" && (
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Địa chỉ giao hàng</h2>
                  <button
                    className="px-3 py-2 rounded-lg border text-emerald-600 border-emerald-500 flex items-center gap-1"
                    onClick={handleOpenAddAddress}
                  >
                    <Plus size={14} /> Thêm địa chỉ
                  </button>
                </div>

                {/* FORM */}
                {showAddressForm && (
                  <form
                    onSubmit={handleSubmitAddress}
                    className="p-4 mb-4 bg-slate-50 rounded-lg space-y-3"
                  >
                    <h3 className="font-semibold">
                      {isEditAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        placeholder="Tên người nhận"
                        className="ui-input"
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
                        className="ui-input"
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
                        className="ui-input col-span-2"
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
                        className="ui-input"
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
                        className="ui-input"
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
                        className="ui-input"
                        value={addressForm.ma_buu_dien}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            ma_buu_dien: e.target.value,
                          })
                        }
                      />
                    </div>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={addressForm.la_mac_dinh}
                        onChange={(e) =>
                          setAddressForm({
                            ...addressForm,
                            la_mac_dinh: e.target.checked,
                          })
                        }
                      />
                      Đặt làm mặc định
                    </label>

                    <button className="btn-emerald px-4 py-2">
                      {isEditAddress ? "Lưu" : "Thêm"}
                    </button>
                  </form>
                )}

                {/* LIST */}
                {loadingAddresses ? (
                  <p>Đang tải...</p>
                ) : addresses.length === 0 ? (
                  <p>Chưa có địa chỉ nào.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        className="p-4 border rounded-xl space-y-2"
                      >
                        <div className="flex justify-between">
                          <p className="font-bold">{a.ten_nguoi_nhan}</p>
                          {a.la_mac_dinh && (
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded">
                              Mặc định
                            </span>
                          )}
                        </div>

                        <p className="text-sm">SĐT: {a.so_dien_thoai}</p>
                        <p className="text-sm">
                          {[a.dia_chi_cu_the, a.phuong_xa, a.tinh_thanh]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        <div className="flex flex-wrap gap-3 text-xs mt-2">
                          <button
                            className="text-emerald-600"
                            onClick={() => handleEditAddress(a)}
                          >
                            Sửa
                          </button>
                          <button
                            className="text-red-500"
                            onClick={() => handleDeleteAddress(a.id)}
                          >
                            Xóa
                          </button>
                          {!a.la_mac_dinh && (
                            <button
                              className="text-emerald-600"
                              onClick={() => handleSetDefault(a.id)}
                            >
                              Mặc định
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= ORDERS ================= */}
            {activeTab === "orders" && (
              <div className="p-6 bg-white rounded-xl shadow-sm">
                {!selectedOrder ? (
                  <>
                    <h2 className="text-lg font-bold mb-4">Đơn hàng của tôi</h2>

                    {loadingOrders ? (
                      <p>Đang tải...</p>
                    ) : orderError ? (
                      <p className="text-red-500 text-sm">
                        Không thể tải đơn hàng:{" "}
                        {orderErrorObj?.message || "Lỗi không xác định"}
                      </p>
                    ) : orders.length === 0 ? (
                      <p>Chưa có đơn hàng nào</p>
                    ) : (
                      <div className="space-y-3">
                        {orders.map((od) => (
                          <OrderCard
                            key={od.id}
                            order={od}
                            onClick={() => setSelectedOrder(od)}
                            onCancel={handleOpenCancel}
                            onRequestReturn={handleOpenReturn}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* HEADER chi tiết */}
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h2 className="text-lg font-bold">
                          Chi tiết đơn hàng #{selectedOrder.ma_don_hang}
                        </h2>
                        <p className="text-xs text-slate-500">
                          Ngày đặt:{" "}
                          {selectedOrder.ngay_tao
                            ? new Date(selectedOrder.ngay_tao).toLocaleString(
                                "vi-VN"
                              )
                            : "-"}
                        </p>
                      </div>
                      <button
                        className="text-sm text-emerald-600 hover:underline"
                        onClick={() => setSelectedOrder(null)}
                      >
                        ← Quay lại danh sách
                      </button>
                    </div>

                    <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span>Trạng thái:</span>
                        <OrderStatusBadge
                          trang_thai={selectedOrder.trang_thai}
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {canCancel(selectedOrder.trang_thai) && (
                          <button
                            className="px-3 py-1 rounded-full border border-red-400 text-red-600 hover:bg-red-50"
                            onClick={() => handleOpenCancel(selectedOrder)}
                          >
                            Huỷ đơn
                          </button>
                        )}
                        {canRequestReturn(selectedOrder.trang_thai) && (
                          <button
                            className="px-3 py-1 rounded-full border border-amber-400 text-amber-700 hover:bg-amber-50"
                            onClick={() => handleOpenReturn(selectedOrder)}
                          >
                            Yêu cầu đổi/trả
                          </button>
                        )}
                      </div>
                    </div>

                    {/* DANH SÁCH SẢN PHẨM */}
                    <div className="border rounded-xl p-4 mb-4">
                      <h3 className="font-semibold mb-3">Sản phẩm</h3>
                      <div className="divide-y">
                        {(selectedOrder.items || []).map((item) => (
                          <div
                            key={
                              item.id ||
                              `${item.bien_the_san_pham_id}-${item.ten_san_pham_luc_mua}`
                            }
                            className="py-3 flex justify-between text-sm"
                          >
                            <div className="max-w-[70%]">
                              <p className="font-medium">
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
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">
                                Đơn giá: {fmtVND(item.don_gia_luc_mua)}
                              </p>
                              <p className="font-semibold">
                                {fmtVND(item.so_luong * item.don_gia_luc_mua)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TỔNG TIỀN */}
                    <div className="border rounded-xl p-4 max-w-md ml-auto">
                      <h3 className="font-semibold mb-3">Tổng thanh toán</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Tạm tính sản phẩm</span>
                          <span>{fmtVND(calcProductTotal(selectedOrder))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Phí vận chuyển</span>
                          <span>{fmtVND(getShippingFee(selectedOrder))}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-bold text-base">
                          <span>Thành tiền</span>
                          <span>{fmtVND(calcGrandTotal(selectedOrder))}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ================= REVIEWS ================= */}
            {activeTab === "reviews" && (
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h2 className="text-lg font-bold mb-4">Đánh giá sản phẩm</h2>

                {loadingMyReviews ? (
                  <p>Đang tải danh sách đánh giá...</p>
                ) : myReviewsError ? (
                  <p className="text-sm text-red-500">
                    Không tải được đánh giá:{" "}
                    {myReviewsErrorObj?.message || "Lỗi không xác định"}
                  </p>
                ) : myReviews.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Bạn chưa có đánh giá nào.
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
                            className="border rounded-xl p-4 flex flex-col gap-2 bg-white/80"
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
                                    <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
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
                                  new Date(rv.ngay_tao).toLocaleString("vi-VN")}
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
                                onClick={() => handleOpenProductFromReview(rv)}
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

                    {/* Phân trang đánh giá */}
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
                              className={`px-3 py-1 rounded-lg text-xs ${
                                active
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
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
              </div>
            )}
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
    </div>
  );
}

// -------------------------------------------------------
// COMPONENTS NHỎ
// -------------------------------------------------------
function MenuButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-2
      ${
        active
          ? "bg-emerald-100 text-emerald-700"
          : "hover:bg-slate-100 text-slate-800"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// Hàng sao nhỏ dùng trong tab "Đánh giá sản phẩm"
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
