// frontend/src/api/reviewsApi.js
// API cho đánh giá sản phẩm — tách riêng để dễ cache/invalidate & mở rộng

import { api, USE_MOCK_API, delay } from "./publicApi";

// Mock store nho nhỏ cho DEV
const MOCK_REVIEWS_DB = new Map(); // key: productId -> {items:[], total:number}

export async function getReviews(productId, { page = 1, limit = 10 } = {}) {
  if (USE_MOCK_API) {
    await delay(200);
    const store = MOCK_REVIEWS_DB.get(productId) || { items: [], total: 0 };
    const start = (page - 1) * limit;
    return {
      items: store.items.slice(start, start + limit),
      total: store.total,
      page,
      totalPages: Math.max(1, Math.ceil(store.total / limit)),
    };
  }
  const res = await api.get(`/products/${productId}/reviews`, {
    params: { page, limit },
  });
  return res.data;
}

export async function submitReview(
  productId,
  { rating, content, willRecommend, name, phone, images = [] }
) {
  if (USE_MOCK_API) {
    await delay(500);
    const store = MOCK_REVIEWS_DB.get(productId) || { items: [], total: 0 };
    const review = {
      id: Date.now(),
      rating,
      content,
      willRecommend: !!willRecommend,
      name,
      phone,
      images: images.map((f) =>
        typeof f === "string" ? f : URL.createObjectURL(f)
      ),
      created_at: new Date().toISOString(),
    };
    store.items.unshift(review);
    store.total += 1;
    MOCK_REVIEWS_DB.set(productId, store);
    return { ok: true, id: review.id };
  }

  const form = new FormData();
  form.append("rating", rating);
  form.append("content", content || "");
  form.append("willRecommend", Boolean(willRecommend));
  form.append("name", name || "");
  form.append("phone", phone || "");
  images.slice(0, 3).forEach((f) => form.append("images", f));

  const res = await api.post(`/products/${productId}/reviews`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
