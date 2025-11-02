// src/validation/thuong_hieu.js
import * as yup from "yup";
import { Patterns, validateMaThuongHieu } from "./shared";

export const thuong_hieu_base_schema = yup.object({
  ma_thuong_hieu: yup
    .string()
    .matches(
      Patterns.MA_THUONG_HIEU,
      "Mã thương hiệu phải là chữ in hoa, 2-5 ký tự"
    )
    .test("valid-ma", "Mã thương hiệu không hợp lệ", validateMaThuongHieu)
    .required("Mã thương hiệu là bắt buộc"),

  ten_thuong_hieu: yup
    .string()
    .trim()
    .min(2, "Tên thương hiệu phải có ít nhất 2 ký tự")
    .max(100, "Tên thương hiệu không được quá 100 ký tự")
    .required("Tên thương hiệu là bắt buộc"),

  mo_ta: yup
    .string()
    .trim()
    .max(500, "Mô tả không được quá 500 ký tự")
    .nullable(),
  logo_url: yup.string().url("URL logo phải hợp lệ").nullable(),
  website: yup.string().url("Website phải là URL hợp lệ").nullable(),
  trang_thai: yup.boolean().default(true),
});

export const thuong_hieu_create_schema = thuong_hieu_base_schema.clone();

export const thuong_hieu_update_schema = yup
  .object({
    ma_thuong_hieu: yup
      .string()
      .matches(Patterns.MA_THUONG_HIEU, "Mã thương hiệu không hợp lệ")
      .test("valid-ma", "Mã thương hiệu không hợp lệ", validateMaThuongHieu),
    ten_thuong_hieu: yup.string().trim().min(2).max(100),
    mo_ta: yup.string().trim().max(500).nullable(),
    logo_url: yup.string().url("URL logo phải hợp lệ").nullable(),
    website: yup.string().url("Website phải là URL hợp lệ").nullable(),
    trang_thai: yup.boolean(),
  })
  .noUnknown(true);

// 👇 Thêm schema phản hồi (response)
export const thuong_hieu_response_schema = thuong_hieu_base_schema.shape({
  id: yup.number().required("ID bắt buộc"),
});
