// src/hooks/schemas/products.js
import * as yup from "yup";

// Schema cho Hình ảnh
export const hinhAnhCreateSchema = yup.object({
  url: yup.string().url("URL không hợp lệ").required("URL là bắt buộc"),
  public_id: yup.string().required("Public ID là bắt buộc"),
  alt_text: yup.string().max(200, "Alt text tối đa 200 ký tự"),
  la_anh_dai_dien: yup.boolean().default(false),
});

// Schema cho Biến thể
export const bienTheCreateSchema = yup.object({
  ten_bien_the: yup.string().max(100, "Tên biến thể tối đa 100 ký tự"),
  trang_thai_kich_hoat: yup
    .string()
    .oneOf(["dang_ban", "ngung_ban", "tam_het"])
    .default("dang_ban"),
  gia_ban: yup
    .number()
    .min(0, "Giá bán phải lớn hơn 0")
    .required("Giá bán là bắt buộc"),
  gia_khuyen_mai: yup
    .number()
    .min(0, "Giá khuyến mãi phải lớn hơn 0")
    .nullable(),
  ngay_bat_dau_khuyen_mai: yup.date().nullable(),
  ngay_ket_thuc_khuyen_mai: yup.date().nullable(),
  so_luong_ton: yup
    .number()
    .min(0, "Số lượng tồn không được âm")
    .required("Số lượng tồn là bắt buộc"),
  hinh_anhs: yup.array().of(hinhAnhCreateSchema).default([]),
});

// Schema cho Sản phẩm
export const sanPhamCreateSchema = yup.object({
  danh_muc_id: yup.number().required("Danh mục là bắt buộc"),
  thuong_hieu_id: yup.number().required("Thương hiệu là bắt buộc"),
  ten_san_pham: yup
    .string()
    .max(200, "Tên sản phẩm tối đa 200 ký tự")
    .required("Tên sản phẩm là bắt buộc"),
  mo_ta: yup.string(),
  thong_so_ky_thuat: yup.object(),
  trang_thai: yup
    .string()
    .oneOf(["dang_ban", "ngung_ban", "tam_het"])
    .default("dang_ban"),
  bien_the_san_phams: yup.array().of(bienTheCreateSchema).default([]),
});

export const sanPhamUpdateSchema = yup.object({
  danh_muc_id: yup.number(),
  thuong_hieu_id: yup.number(),
  ten_san_pham: yup.string().max(200, "Tên sản phẩm tối đa 200 ký tự"),
  mo_ta: yup.string(),
  thong_so_ky_thuat: yup.object(),
  trang_thai: yup.string().oneOf(["dang_ban", "ngung_ban", "tam_het"]),
});
