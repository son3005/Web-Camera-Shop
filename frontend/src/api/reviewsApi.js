// frontend/src/api/reviewsApi.js
// API đánh giá cho giao diện khách hàng.
// - Dev/mock: lưu trong localStorage theo productId
// - Prod: gọi backend /products/:id/reviews

import { api, USE_MOCK_API, delay } from "./publicApi";

const LS_KEY = "wcs_reviews_v1";

function readLS() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function writeLS(obj) {
  localStorage.setItem(LS_KEY, JSON.stringify(obj));
}

/** Lấy danh sách review của 1 sản phẩm */
export async function getReviews(productId) {
  if (!productId) return { items: [], total: 0 };
  if (USE_MOCK_API) {
    await delay(200);
    const db = readLS();
    const arr = db[productId] || [];
    // sắp xếp mới nhất trước
    arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { items: arr, total: arr.length };
  }
  const res = await api.get(`/products/${productId}/reviews`);
  return { items: res.data?.items || [], total: res.data?.total || 0 };
}

/** Thêm review */
export async function addReview(productId, payload) {
  // payload: { name, rating, content }
  if (USE_MOCK_API) {
    await delay(250);
    const db = readLS();
    const arr = db[productId] || [];
    const item = {
      id: `${productId}-${Date.now()}`,
      name: payload.name?.trim() || "Ẩn danh",
      rating: Math.max(1, Math.min(5, Number(payload.rating || 0))),
      content: String(payload.content || "").trim(),
      createdAt: new Date().toISOString(),
    };
    arr.push(item);
    db[productId] = arr;
    writeLS(db);
    return { ok: true, item };
  }
  const res = await api.post(`/products/${productId}/reviews`, payload);
  return res.data;
}
