import { apiPrivate } from "../lib/axios";

// GET PROFILE
export const layThongTinCaNhan = async () => {
  const data = await apiPrivate.get("/nguoi-dung/thong-tin-ca-nhan");
  console.log(">>> PROFILE RAW:", data);
  return data;    // ⬅️ KHÔNG .data VÌ INTERCEPTOR TRẢ VỀ LUÔN JSON
};

// UPDATE PROFILE
export const capNhatThongTin = async (body) => {
  const data = await apiPrivate.put("/nguoi-dung/cap-nhat-thong-tin", body);
  return data;    // ⬅️ KHÔNG .data
};
