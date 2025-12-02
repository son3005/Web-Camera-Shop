// src/api/slideshowApi.js
// API ảnh trình chiếu (Slideshow) — public
// GET /api/anh-trinh-chieu/public

import apiClient from "./apiClient";

export async function getPublicSlides() {
  const res = await apiClient.get("/anh-trinh-chieu/public");
  const body = res.data || {};
  const list = body.anh_trinh_chieus || body.data || [];

  return [...list].sort((a, b) => (a.vi_tri ?? 0) - (b.vi_tri ?? 0));
}
