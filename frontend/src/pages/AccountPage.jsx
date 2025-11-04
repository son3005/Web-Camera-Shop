// frontend/src/pages/AccountPage.jsx
// Trang quản lý thông tin khách hàng (phía người dùng)

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  User,
  MapPin,
  Package,
  Star,
  History,
  Mail,
  Phone,
  Save,
  Plus,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getCustomers } from "../api/customerApi"; // tận dụng mock admin

export default function AccountPage() {
  const authUser = useSelector((state) => state.auth.user);
  const [activeTab, setActiveTab] = useState("profile");

  const [customer, setCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(true);

  const [profileForm, setProfileForm] = useState({
    ho_ten: authUser?.ho_ten || authUser?.name || "",
    email: authUser?.email || "",
    so_dien_thoai: authUser?.so_dien_thoai || "",
  });

  // ====== ĐỊA CHỈ (state thay đổi được) ======
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      ten: "Nhà riêng",
      chi_tiet: "123 Nguyễn Văn Cừ, Q.5, TP.HCM",
      mac_dinh: true,
    },
    {
      id: 2,
      ten: "Công ty",
      chi_tiet: "Tầng 5, tòa nhà ABC, Q.1, TP.HCM",
      mac_dinh: false,
    },
  ]);

  // form địa chỉ (dùng chung cho thêm / sửa)
  const [addressForm, setAddressForm] = useState({
    id: null,
    ten: "",
    chi_tiet: "",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditAddress, setIsEditAddress] = useState(false);

  // ====== mock đơn hàng ======
  const orders = [
    {
      id: "DH0001",
      ngay: "2025-11-01",
      trang_thai: "dang_giao",
      tong_tien: 34500000,
      items: [
        { ten: "Sony XM-105", so_luong: 1 },
        { ten: "Thẻ nhớ 128GB", so_luong: 1 },
      ],
    },
    {
      id: "DH0002",
      ngay: "2025-10-22",
      trang_thai: "da_giao",
      tong_tien: 12800000,
      items: [{ ten: "Canon M50 Mark II", so_luong: 1 }],
    },
    {
      id: "DH0003",
      ngay: "2025-10-10",
      trang_thai: "da_huy",
      tong_tien: 2500000,
      items: [{ ten: "Chân máy ảnh", so_luong: 1 }],
    },
  ];

  const fmtVND = (n) =>
    Number(n || 0).toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    }) + "₫";

  // ====== load customer từ mock admin theo email ======
  useEffect(() => {
    let ignore = false;
    async function loadCustomer() {
      if (!authUser?.email) {
        setLoadingCustomer(false);
        return;
      }
      setLoadingCustomer(true);
      try {
        const res = await getCustomers({
          q: authUser.email,
          limit: 1,
          page: 1,
        });
        const found = res?.data?.[0];
        if (!ignore) {
          if (found) {
            setCustomer(found);
            setProfileForm((prev) => ({
              ...prev,
              ho_ten: found.name || prev.ho_ten,
              email: found.email || prev.email,
              so_dien_thoai: found.phone || prev.so_dien_thoai,
            }));
          }
          setLoadingCustomer(false);
        }
      } catch (err) {
        console.error("load customer failed:", err);
        if (!ignore) setLoadingCustomer(false);
      }
    }
    loadCustomer();
    return () => {
      ignore = true;
    };
  }, [authUser]);

  // ====== SAVE PROFILE (demo) ======
  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert("(demo) Đã lưu thông tin. Sau này nối API thật ở đây.");
  };

  // ====== ADDRESS HANDLERS ======

  // mở form thêm mới
  const handleOpenAddAddress = () => {
    setIsEditAddress(false);
    setAddressForm({ id: null, ten: "", chi_tiet: "" });
    setShowAddressForm(true);
  };

  // mở form sửa
  const handleEditAddress = (addr) => {
    setIsEditAddress(true);
    setAddressForm({
      id: addr.id,
      ten: addr.ten,
      chi_tiet: addr.chi_tiet,
    });
    setShowAddressForm(true);
  };

  // xóa địa chỉ
  const handleDeleteAddress = (id) => {
    if (!confirm("Bạn chắc chắn muốn xóa địa chỉ này?")) return;
    setAddresses((prev) => {
      const filtered = prev.filter((a) => a.id !== id);
      // nếu xóa địa chỉ đang là mặc định → set mặc định lại cái đầu tiên
      if (!filtered.some((a) => a.mac_dinh) && filtered.length > 0) {
        filtered[0].mac_dinh = true;
      }
      return [...filtered];
    });
  };

  // đặt làm mặc định
  const handleSetDefaultAddress = (id) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        mac_dinh: a.id === id,
      }))
    );
  };

  // submit form thêm / sửa địa chỉ
  const handleSubmitAddress = (e) => {
    e.preventDefault();
    const { id, ten, chi_tiet } = addressForm;
    if (!ten.trim() || !chi_tiet.trim()) {
      alert("Vui lòng nhập đầy đủ tên và địa chỉ.");
      return;
    }

    if (isEditAddress && id != null) {
      // update
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                ten: ten.trim(),
                chi_tiet: chi_tiet.trim(),
              }
            : a
        )
      );
    } else {
      // add
      const newId =
        addresses.length > 0 ? Math.max(...addresses.map((a) => a.id)) + 1 : 1;
      setAddresses((prev) => [
        ...prev,
        {
          id: newId,
          ten: ten.trim(),
          chi_tiet: chi_tiet.trim(),
          mac_dinh: prev.length === 0, // nếu là địa chỉ đầu tiên → mặc định
        },
      ]);
    }

    setShowAddressForm(false);
  };

  return (
    <div className="min-h-dvh bg-slate-50/40 dark:bg-slate-950/40 py-6">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Quản lý tài khoản
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Xin chào,{" "}
            {profileForm.ho_ten ||
              authUser?.ho_ten ||
              authUser?.name ||
              authUser?.email ||
              "bạn"}{" "}
            👋
          </p>
          {!loadingCustomer && customer && (
            <p className="text-xs text-slate-400 mt-1">
              Mã khách: {customer.code} · Tổng chi:{" "}
              {fmtVND(customer.totalSpend || 0)} · Số đơn:{" "}
              {customer.orderCount || 0}
            </p>
          )}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <div className="surface-panel p-4 space-y-2 sticky top-20">
              <SideButton
                active={activeTab === "profile"}
                onClick={() => setActiveTab("profile")}
                icon={<User size={16} />}
                label="Cập nhật thông tin cá nhân"
              />
              <SideButton
                active={activeTab === "addresses"}
                onClick={() => setActiveTab("addresses")}
                icon={<MapPin size={16} />}
                label="Quản lý địa chỉ giao hàng"
              />
              <SideButton
                active={activeTab === "orders"}
                onClick={() => setActiveTab("orders")}
                icon={<Package size={16} />}
                label="Đơn hàng của tôi"
              />
              <SideButton
                active={activeTab === "reviews"}
                onClick={() => setActiveTab("reviews")}
                icon={<Star size={16} />}
                label="Đánh giá sản phẩm"
              />
              <SideButton
                active={activeTab === "history"}
                onClick={() => setActiveTab("history")}
                icon={<History size={16} />}
                label="Lịch sử đơn hàng"
              />
            </div>
          </aside>

          {/* Content */}
          <section className="col-span-12 md:col-span-9 space-y-6">
            {/* PROFILE */}
            {activeTab === "profile" && (
              <div className="surface-panel p-6">
                <h2 className="text-lg font-bold mb-4">
                  Cập nhật thông tin cá nhân
                </h2>
                {loadingCustomer ? (
                  <p className="text-sm text-slate-500">Đang tải thông tin…</p>
                ) : (
                  <form className="space-y-4" onSubmit={handleSaveProfile}>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          className="ui-input w-full"
                          value={profileForm.ho_ten}
                          onChange={(e) =>
                            setProfileForm((prev) => ({
                              ...prev,
                              ho_ten: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Email
                        </label>
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" />
                          <input
                            type="email"
                            className="ui-input w-full"
                            value={profileForm.email}
                            readOnly
                          />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Email không thể thay đổi.
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Số điện thoại
                        </label>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" />
                          <input
                            type="tel"
                            className="ui-input w-full"
                            value={profileForm.so_dien_thoai}
                            onChange={(e) =>
                              setProfileForm((prev) => ({
                                ...prev,
                                so_dien_thoai: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 btn-emerald rounded-lg px-4 py-2"
                    >
                      <Save size={16} /> Lưu thay đổi
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="surface-panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Địa chỉ giao hàng</h2>
                  <button
                    onClick={handleOpenAddAddress}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-sm"
                  >
                    <Plus size={14} /> Thêm địa chỉ
                  </button>
                </div>

                {/* form thêm / sửa */}
                {showAddressForm && (
                  <form
                    onSubmit={handleSubmitAddress}
                    className="mb-4 p-4 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-sm">
                        {isEditAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        Đóng
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1">
                          Tên địa chỉ
                        </label>
                        <input
                          className="ui-input w-full"
                          value={addressForm.ten}
                          onChange={(e) =>
                            setAddressForm((prev) => ({
                              ...prev,
                              ten: e.target.value,
                            }))
                          }
                          placeholder="Ví dụ: Nhà riêng, Công ty..."
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs mb-1">Chi tiết</label>
                        <input
                          className="ui-input w-full"
                          value={addressForm.chi_tiet}
                          onChange={(e) =>
                            setAddressForm((prev) => ({
                              ...prev,
                              chi_tiet: e.target.value,
                            }))
                          }
                          placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn-emerald rounded-lg px-4 py-2 text-sm"
                    >
                      {isEditAddress ? "Lưu địa chỉ" : "Thêm địa chỉ"}
                    </button>
                  </form>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {addresses.map((ad) => (
                    <div
                      key={ad.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-emerald-500" />
                          <h3 className="font-semibold">{ad.ten}</h3>
                        </div>
                        {ad.mac_dinh && (
                          <span className="text-[11px] px-2 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                            Mặc định
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {ad.chi_tiet}
                      </p>
                      <div className="flex gap-3 text-xs">
                        <button
                          onClick={() => handleEditAddress(ad)}
                          className="text-emerald-500 hover:underline"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(ad.id)}
                          className="text-red-500 hover:underline"
                        >
                          Xóa
                        </button>
                        {!ad.mac_dinh && (
                          <button
                            onClick={() => handleSetDefaultAddress(ad.id)}
                            className="text-slate-200 hover:underline"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {addresses.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Bạn chưa có địa chỉ nào. Bấm “Thêm địa chỉ”.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS */}
            {activeTab === "orders" && (
              <div className="surface-panel p-6">
                <h2 className="text-lg font-bold mb-4">Đơn hàng của tôi</h2>
                <div className="space-y-3">
                  {orders.map((od) => (
                    <div
                      key={od.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Mã đơn: <span className="font-semibold">{od.id}</span>
                        </p>
                        <p className="text-xs text-slate-400">
                          Ngày đặt: {od.ngay}
                        </p>
                        <p className="text-sm mt-1">
                          {od.items.map((it) => it.ten).join(", ")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="text-sm font-semibold">
                          {fmtVND(od.tong_tien)}
                        </p>
                        <StatusBadge trang_thai={od.trang_thai} />
                        <button className="text-xs text-emerald-600 hover:underline">
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS */}
            {activeTab === "reviews" && (
              <div className="surface-panel p-6">
                <h2 className="text-lg font-bold mb-4">Đánh giá sản phẩm</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  Bạn chưa có sản phẩm nào cần đánh giá. Khi đơn hàng được giao
                  thành công, sản phẩm sẽ xuất hiện ở đây để bạn chấm sao ⭐
                </p>
              </div>
            )}

            {/* HISTORY */}
            {activeTab === "history" && (
              <div className="surface-panel p-6">
                <h2 className="text-lg font-bold mb-4">Lịch sử đơn hàng</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 pr-4">Mã đơn</th>
                        <th className="py-2 pr-4">Ngày</th>
                        <th className="py-2 pr-4">Trạng thái</th>
                        <th className="py-2 pr-4">Tổng tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((od) => (
                        <tr
                          key={od.id}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="py-2 pr-4">{od.id}</td>
                          <td className="py-2 pr-4">{od.ngay}</td>
                          <td className="py-2 pr-4">
                            <StatusBadge trang_thai={od.trang_thai} small />
                          </td>
                          <td className="py-2 pr-4">{fmtVND(od.tong_tien)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

// ====== components nhỏ ======
function SideButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
        active
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusBadge({ trang_thai, small = false }) {
  let text = "Không xác định";
  let cls =
    "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100";
  let icon = null;

  switch (trang_thai) {
    case "cho_xac_nhan":
      text = "Chờ xác nhận";
      cls =
        "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100";
      break;
    case "da_xac_nhan":
      text = "Đã xác nhận";
      cls =
        "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-100";
      break;
    case "dang_giao":
      text = "Đang giao";
      cls =
        "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100";
      icon = <Truck size={small ? 10 : 12} />;
      break;
    case "da_giao":
    case "hoan_thanh":
      text = "Đã giao";
      cls =
        "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100";
      icon = <CheckCircle2 size={small ? 10 : 12} />;
      break;
    case "da_huy":
      text = "Đã hủy";
      cls =
        "inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-100";
      icon = <XCircle size={small ? 10 : 12} />;
      break;
    default:
      break;
  }

  return (
    <span className={cls}>
      {icon}
      <span className={small ? "text-[11px]" : "text-xs"}>{text}</span>
    </span>
  );
}
