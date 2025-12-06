// src/api/capDoApi.js
// ----------------------------------------------------
// API client cho Quản lý Cấp độ (cap-do)
// Base: http://localhost:5000/api
// ----------------------------------------------------
import apiClient from "./apiClient";

// ✅ LƯU Ý: tất cả endpoint đều có "/" ở cuối để tránh 308 redirect (CORS preflight sẽ fail)

// GET /api/cap-do/?page=&per_page=
export const getLevels = async ({ page = 1, per_page = 10 } = {}) => {
  const res = await apiClient.get("/cap-do/", {
    params: { page, per_page },
  });
  return res.data;
};

// POST /api/cap-do/
export const createLevel = async (payload) => {
  const res = await apiClient.post("/cap-do/", payload);
  return res.data;
};

// PUT /api/cap-do/:id
export const updateLevel = async (id, payload) => {
  const res = await apiClient.put(`/cap-do/${id}`, payload);
  return res.data;
};

// DELETE /api/cap-do/:id
export const deleteLevel = async (id) => {
  const res = await apiClient.delete(`/cap-do/${id}`);
  return res.data;
};

// GET /api/cap-do/:id/kiem-tra-su-dung
export const checkLevelUsage = async (id) => {
  const res = await apiClient.get(`/cap-do/${id}/kiem-tra-su-dung`);
  return res.data;
};
