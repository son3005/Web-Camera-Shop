// src/hooks/schemas/catalogs.js
import * as yup from "yup";

// Schema cho Danh mục
export const danhMucCreateSchema = yup.object({
  ma_danh_muc: yup
    .string()
    .max(5, "Mã danh mục tối đa 5 ký tự")
    .required("Mã danh mục là bắt buộc"),
  ten_danh_muc: yup
    .string()
    .max(100, "Tên danh mục tối đa 100 ký tự")
    .required("Tên danh mục là bắt buộc"),
});

export const danhMucUpdateSchema = yup.object({
  ma_danh_muc: yup.string().max(5, "Mã danh mục tối đa 5 ký tự"),
  ten_danh_muc: yup.string().max(100, "Tên danh mục tối đa 100 ký tự"),
});

// Schema cho Thương hiệu
export const thuongHieuCreateSchema = yup.object({
  ma_thuong_hieu: yup
    .string()
    .max(5, "Mã thương hiệu tối đa 5 ký tự")
    .required("Mã thương hiệu là bắt buộc"),
  ten_thuong_hieu: yup
    .string()
    .max(100, "Tên thương hiệu tối đa 100 ký tự")
    .required("Tên thương hiệu là bắt buộc"),
  logo_url: yup.string().url("URL logo không hợp lệ"),
  public_id: yup.string(),
});

export const thuongHieuUpdateSchema = yup.object({
  ma_thuong_hieu: yup.string().max(5, "Mã thương hiệu tối đa 5 ký tự"),
  ten_thuong_hieu: yup.string().max(100, "Tên thương hiệu tối đa 100 ký tự"),
  logo_url: yup.string().url("URL logo không hợp lệ"),
});
