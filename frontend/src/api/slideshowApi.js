// src/api/slideshowApi.js
// API ảnh trình chiếu (Slideshow)

import apiClient from "./apiClient";

// ================== Helper chuyển đổi trạng thái ==================
const toEnumTrangThai = (value) => {
  // nhận vào true/false hoặc string, trả ra enum đúng với backend
  if (value === true || value === "hieu_luc") return "hieu_luc";
  if (value === false || value === "khong_hieu_luc") return "khong_hieu_luc";
  // mặc định cho an toàn
  return "hieu_luc";
};

const fromEnumTrangThai = (value) => {
  // convert enum backend về boolean cho FE xài
  // backend trả "HIEU_LUC"/"KHONG_HIEU_LUC" hoặc "hieu_luc"/"khong_hieu_luc"
  const v = String(value || "").toLowerCase();
  return v === "hieu_luc" || v === "hieu_lực" || v === "true";
};

// ================== Chuẩn hoá slide (dùng cho cả private & public) ==================
const normalizeSlide = (raw, idxForKey = 0) => {
  if (!raw) return null;

  return {
    // đảm bảo luôn có id cho React key & delete/update
    id: raw.anh_trinh_chieu_id ?? raw.id ?? idxForKey,
    tieu_de: raw.tieu_de || "",
    lien_ket: raw.lien_ket || "",
    vi_tri: raw.vi_tri ?? 1,
    hinh_anh_url: raw.hinh_anh_url || raw.duong_dan_anh || "",
    // có thể không có trang_thai (ở public), khi đó để undefined
    trang_thai:
      raw.trang_thai !== undefined
        ? fromEnumTrangThai(raw.trang_thai)
        : undefined,
  };
};

// ================== ADMIN: Lấy danh sách private ==================
export async function getPrivateSlides() {
  const res = await apiClient.get("/anh-trinh-chieu/private");
  const body = res.data || {};
  const list = body.anh_trinh_chieus || body.data || [];

  return [...list]
    .map((s, idx) => normalizeSlide(s, idx))
    .filter(Boolean)
    .sort((a, b) => (a.vi_tri ?? 0) - (b.vi_tri ?? 0));
}

// ================== ADMIN: Tạo mới slide ==================
export async function createSlide({
  tieu_de,
  lien_ket,
  vi_tri,
  trang_thai,
  file,
}) {
  const fd = new FormData();

  const payload = {
    tieu_de: tieu_de || "",
    lien_ket: lien_ket || "",
    vi_tri: Number(vi_tri) || 1,
    trang_thai: toEnumTrangThai(trang_thai),
  };

  fd.append("anh_trinh_chieu", JSON.stringify(payload));
  if (file) {
    fd.append("anh_trinh_chieu_file", file);
  }

  const res = await apiClient.post("/anh-trinh-chieu/private", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return normalizeSlide(res.data);
}

// ================== ADMIN: Cập nhật slide ==================
export async function updateSlide(id, payload) {
  const body = { ...payload };

  if (payload.trang_thai !== undefined) {
    body.trang_thai = toEnumTrangThai(payload.trang_thai);
  }

  const res = await apiClient.put(`/anh-trinh-chieu/private/${id}`, body);
  return normalizeSlide(res.data);
}

// ================== ADMIN: Xoá slide ==================
export async function deleteSlide(id) {
  if (id === undefined || id === null) {
    throw new Error("Slide id is undefined when calling deleteSlide");
  }
  await apiClient.delete(`/anh-trinh-chieu/private/${id}`);
}

// ================== PUBLIC: Lấy slide cho homepage ==================
export async function getPublicSlides() {
  const res = await apiClient.get("/anh-trinh-chieu/public");
  const body = res.data || {};
  const list = body.anh_trinh_chieus || body.data || [];

  // public đã được backend lọc chỉ còn banner đang HIEU_LUC,
  // nên KHÔNG filter theo trang_thai nữa
  return [...list]
    .map((s, idx) => normalizeSlide(s, idx))
    .filter(Boolean)
    .sort((a, b) => (a.vi_tri ?? 0) - (b.vi_tri ?? 0));
}
