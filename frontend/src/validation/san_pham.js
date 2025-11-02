// validation/san_pham.js
import * as yup from "yup";

import { TrangThaiSanPhamEnum } from "./shared"; // Giả sử export bằng ES Module
import { danh_muc_response_schema } from "./danh_muc";
import { thuong_hieu_response_schema } from "./thuong_hieu";
import {
  bien_the_san_pham_create_schema,
  bien_the_san_pham_response_schema,
  bien_the_san_pham_update_schema,
} from "./bien_the_san_pham";

const san_pham_base_schema = yup.object({
  danh_muc_id: yup.number().required("Danh mục ID bắt buộc"),
  thuong_hieu_id: yup.number().required("Thương hiệu ID bắt buộc"),
  ten_san_pham: yup.string().max(200).required("Tên sản phẩm bắt buộc"),
  mo_ta: yup.string().nullable(),
  thong_so_ky_thuat: yup.object().nullable(),
  trang_thai: yup
    .mixed()
    .oneOf(Object.values(TrangThaiSanPhamEnum))
    .default(TrangThaiSanPhamEnum.DANG_BAN),
  ngay_tao: yup.date().nullable(),
  ngay_cap_nhat: yup.date().nullable(),
});

export const san_pham_create_schema = san_pham_base_schema.shape({
  bien_the_san_phams: yup
    .array()
    .of(bien_the_san_pham_create_schema)
    .default([]),
});

export const san_pham_update_schema = yup.object({
  danh_muc_id: yup.number().nullable(),
  thuong_hieu_id: yup.number().nullable(),
  ten_san_pham: yup.string().max(200).nullable(),
  mo_ta: yup.string().nullable(),
  thong_so_ky_thuat: yup.object().nullable(),
  trang_thai: yup.mixed().oneOf(Object.values(TrangThaiSanPhamEnum)).nullable(),
  cac_bien_the: yup.array().of(bien_the_san_pham_update_schema).nullable(),
});

export const san_pham_delete_schema = yup.object({
  id: yup.number().required("ID bắt buộc"),
});

export const san_pham_response_schema = san_pham_base_schema.shape({
  id: yup.number().required(),
  ma_san_pham: yup.string().max(24).required(),
  danh_muc: danh_muc_response_schema.required(),
  thuong_hieu: thuong_hieu_response_schema.required(),
  cac_bien_the: yup.array().of(bien_the_san_pham_response_schema).default([]),
});

export const san_pham_public_schema = san_pham_response_schema.shape({
  trung_binh_danh_gia: yup.number().nullable(),
  so_luong_danh_gia: yup.number().default(0),
});

export const san_pham_list_response_schema = yup.object({
  data: yup.array().of(san_pham_response_schema).required(),
  pagination: yup
    .object({
      page: yup.number().required(),
      per_page: yup.number().required(),
      total: yup.number().required(),
      pages: yup.number().required(),
    })
    .required(),
});
