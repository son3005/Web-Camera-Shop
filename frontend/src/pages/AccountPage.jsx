// frontend/src/pages/AccountPage.jsx

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  User,
  MapPin,
  History,
  Star,
  Mail,
  Phone,
  Save,
  Plus,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  layThongTinCaNhan,
  capNhatThongTin,
} from "../api/userApi";

import {
  layDanhSachDiaChi,
  taoDiaChi,
  capNhatDiaChi,
  xoaDiaChi,
  datMacDinh,
} from "../api/addressApi";

import { layDonHangNguoiDung } from "../api/khachHangDonHangApi";

// -------------------------------------------------------
// COMPONENT CHÍNH
// -------------------------------------------------------
export default function AccountPage() {
  const authUser = useSelector((state) => state.auth.user);

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
  // ORDERS
  // =====================
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const fmtVND = (n) =>
    Number(n || 0).toLocaleString("vi-VN") + "₫";

  const calcTotal = (order) =>
    (order.items || []).reduce(
      (s, i) => s + i.so_luong * i.don_gia_luc_mua,
      0
    );

  // =====================
  // LOAD PROFILE
  // =====================
  useEffect(() => {
    async function load() {
      try {
        const profiledata = await layThongTinCaNhan();
        console.log(">>> PROFILE DATA:", profiledata);
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
      console.log(">>> RAW ADDRESS RESPONSE:", res);
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

  // =====================
  // LOAD ORDERS
  // =====================
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await layDonHangNguoiDung();
        setOrders(res || []);
      } catch (err) {
        console.error("Load orders failed:", err);
      } finally {
        setLoadingOrders(false);
      }
    }
    fetchOrders();
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
      alert("Lỗi cập nhật thông tin số điện thoại đã có được sử dụng!");
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
      alert("Không thể xóa!");
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
              onClick={() => setActiveTab("profile")}
              icon={<User size={16} />}
              label="Thông tin cá nhân"
            />
            <MenuButton
              active={activeTab === "address"}
              onClick={() => setActiveTab("address")}
              icon={<MapPin size={16} />}
              label="Địa chỉ giao hàng"
            />
            <MenuButton
              active={activeTab === "orders"}
              onClick={() => setActiveTab("orders")}
              icon={<History size={16} />}
              label="Lịch sử đơn hàng"
            />
            <MenuButton
              active={activeTab === "reviews"}
              onClick={() => setActiveTab("reviews")}
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
                  // VIEW MODE
                  <div className="space-y-2">
                    <p><b>Họ tên:</b> {profile?.ho_ten}</p>
                    <p><b>Email:</b> {profile?.email}</p>
                    <p><b>Số điện thoại:</b> {profile?.so_dien_thoai}</p>

                    <button
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
                      onClick={() => setEditMode(true)}
                    >
                      Sửa thông tin
                    </button>
                  </div>
                ) : (
                  // EDIT MODE
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
                    className="px-3 py-2 rounded-lg border text-emerald-600 border-emerald-500"
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
                        placeholder="Địa chỉ cụ thể"
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
                  <div className="grid grid-cols-2 gap-4">
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
                          {[
                            a.dia_chi_cu_the,
                            a.phuong_xa,
                            a.tinh_thanh,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>

                        <div className="flex gap-3 text-xs mt-2">
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
                <h2 className="text-lg font-bold mb-4">Lịch sử đơn hàng</h2>

                {loadingOrders ? (
                  <p>Đang tải...</p>
                ) : orders.length === 0 ? (
                  <p>Chưa có đơn hàng nào</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((od) => (
                      <div
                        key={od.id}
                        className="p-4 border rounded-xl flex justify-between"
                      >
                        <div>
                          <p className="text-sm">
                            <b>Mã đơn:</b> {od.ma_don_hang}
                          </p>
                          <p className="text-xs text-slate-500">
                            Ngày đặt:{" "}
                            {new Date(od.ngay_tao).toLocaleDateString("vi-VN")}
                          </p>
                          <p className="text-sm mt-1">
                            {(od.items || [])
                              .map((i) => i.ten_san_pham_luc_mua)
                              .join(", ")}
                          </p>
                        </div>

                        <div className="flex flex-col items-end">
                          <p className="font-bold">
                            {fmtVND(calcTotal(od))}
                          </p>
                          <StatusBadge trang_thai={od.trang_thai} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= REVIEWS ================= */}
            {activeTab === "reviews" && (
              <div className="p-6 bg-white rounded-xl shadow-sm">
                <h2 className="text-lg font-bold mb-4">Đánh giá sản phẩm</h2>
                <p>Chưa có sản phẩm cần đánh giá</p>
              </div>
            )}
          </div>
        </div>
      </div>
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

function StatusBadge({ trang_thai }) {
  const map = {
    cho_xac_nhan: ["Chờ xác nhận", "bg-amber-100 text-amber-700"],
    da_xac_nhan: ["Đã xác nhận", "bg-sky-100 text-sky-700"],
    dang_giao: ["Đang giao", "bg-blue-100 text-blue-700"],
    da_giao: ["Đã giao", "bg-emerald-100 text-emerald-700"],
    da_huy: ["Đã hủy", "bg-red-100 text-red-700"],
  };

  const item = map[trang_thai] || ["Không rõ", "bg-slate-200 text-slate-700"];

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full ${item[1]}`}
    >
      {item[0]}
    </span>
  );
}
