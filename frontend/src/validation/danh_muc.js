// validation/danh_muc.js
import * as yup from "yup";

export const danh_muc_base_schema = yup.object({
  ma_danh_muc: yup.string().max(5).required("Mã danh mục bắt buộc"),
  ten_danh_muc: yup.string().max(100).required("Tên danh mục bắt buộc"),
});

export const danh_muc_create_schema = danh_muc_base_schema.clone();

export const danh_muc_update_schema = yup.object({
  ma_danh_muc: yup.string().max(5).nullable(),
  ten_danh_muc: yup.string().max(100).nullable(),
});

export const danh_muc_delete_schema = yup.object({
  id: yup.number().required("ID bắt buộc"),
});

export const danh_muc_response_schema = danh_muc_base_schema.shape({
  id: yup.number().required(),
});

export const danh_muc_list_response_schema = yup.object({
  data: yup.array().of(danh_muc_response_schema).required(),
  pagination: yup
    .object({
      page: yup.number().required(),
      per_page: yup.number().required(),
      total: yup.number().required(),
      pages: yup.number().required(),
    })
    .required(),
});
