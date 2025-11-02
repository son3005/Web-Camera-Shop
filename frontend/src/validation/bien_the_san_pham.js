// validation/bien_the_san_pham.js
import * as yup from "yup";
import { TrangThaiSanPhamEnum } from "./shared"; // giả sử file shared export ESM
import {
  hinh_anh_create_schema,
  hinh_anh_response_schema,
} from "./hinh_anh_san_pham";

export const bien_the_san_pham_base_schema = yup.object({
  san_pham_id: yup.number().nullable(),
  ten_bien_the: yup.string().max(100).nullable(),
  trang_thai_kich_hoat: yup
    .mixed()
    .oneOf(Object.values(TrangThaiSanPhamEnum))
    .default(TrangThaiSanPhamEnum.DANG_BAN),
  gia_ban: yup.number().positive().required("Giá bán bắt buộc"),
  gia_khuyen_mai: yup.number().positive().nullable(),
  ngay_bat_dau_khuyen_mai: yup.date().nullable(),
  ngay_ket_thuc_khuyen_mai: yup.date().nullable(),
  so_luong_ton: yup.number().min(0).required("Số lượng tồn bắt buộc"),
});

export const bien_the_san_pham_create_schema =
  bien_the_san_pham_base_schema.shape({
    hinh_anhs: yup.array().of(hinh_anh_create_schema).default([]),
  });

export const bien_the_san_pham_update_schema = yup.object({
  ten_bien_the: yup.string().max(100).nullable(),
  trang_thai_kich_hoat: yup
    .mixed()
    .oneOf(Object.values(TrangThaiSanPhamEnum))
    .nullable(),
  gia_ban: yup.number().positive().nullable(),
  gia_khuyen_mai: yup.number().positive().nullable(),
  ngay_bat_dau_khuyen_mai: yup.date().nullable(),
  ngay_ket_thuc_khuyen_mai: yup.date().nullable(),
  so_luong_ton: yup.number().min(0).nullable(),
  new_hinh_anhs: yup.array().of(hinh_anh_create_schema).default([]),
  deleted_hinh_anh_ids: yup.array().of(yup.number()).default([]),
});

export const bien_the_san_pham_delete_schema = yup.object({
  id: yup.number().required("ID bắt buộc"),
});

export const bien_the_san_pham_response_schema =
  bien_the_san_pham_base_schema.shape({
    id: yup.number().required(),
    hinh_anhs: yup.array().of(hinh_anh_response_schema).default([]),
  });
