// validation/hinh_anh_san_pham.js
import * as yup from "yup";

export const hinh_anh_base_schema = yup.object({
  url: yup
    .string()
    .url("URL không hợp lệ")
    .required("URL của hình ảnh bắt buộc"),
  public_id: yup
    .string()
    .max(255, "Public ID tối đa 255 ký tự")
    .required("Public ID bắt buộc"),
  alt_text: yup.string().max(200, "Alt text tối đa 200 ký tự").nullable(),
  la_anh_dai_dien: yup.boolean().default(false),
});

// Schema khi tạo mới (create)
export const hinh_anh_create_schema = hinh_anh_base_schema.clone();

// Schema khi cập nhật (update) – cho phép optional hoặc null
export const hinh_anh_update_schema = yup.object({
  url: yup.string().url("URL không hợp lệ").optional().nullable(),
  public_id: yup
    .string()
    .max(255, "Public ID tối đa 255 ký tự")
    .optional()
    .nullable(),
  alt_text: yup
    .string()
    .max(200, "Alt text tối đa 200 ký tự")
    .optional()
    .nullable(),
  la_anh_dai_dien: yup.boolean().optional().nullable(),
});

// Schema khi xóa (delete)
export const hinh_anh_delete_schema = yup.object({
  id: yup.number().required("ID bắt buộc"),
});

// Schema phản hồi (response)
export const hinh_anh_response_schema = hinh_anh_base_schema.shape({
  id: yup.number().required("ID bắt buộc"),
  bien_the_id: yup.number().required("Biến thể ID bắt buộc"),
});
