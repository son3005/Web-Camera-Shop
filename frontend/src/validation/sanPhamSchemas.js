// src/schemas/sanPhamSchemas.js
import * as Yup from "yup";

// Enum match backend (TrangThaiSanPhamEnum)
/** @enum {string} */
export const TrangThaiSanPhamEnum = {
  DANG_BAN: "DANG_BAN",
  NGUNG_BAN: "NGUNG_BAN",
  HET_HANG: "HET_HANG",
};

// =================================================================
// 1. HÌNH ẢNH (IMAGE)
// =================================================================

/**
 * JSDoc type cho HinhAnh (match HinhAnhResponse Pydantic)
 * @typedef {Object} HinhAnhResponse
 * @property {number} id
 * @property {number} bien_the_id
 * @property {string} url
 * @property {string} public_id
 * @property {string|null} [alt_text]
 * @property {boolean} la_anh_dai_dien
 */

// Yup schema cho HinhAnhCreate (match HinhAnhCreate)
export const hinhAnhCreateSchema = Yup.object({
  url: Yup.string()
    .url("URL không hợp lệ")
    .max(512, "URL quá dài") // Khớp max_length=512
    .required("Bắt buộc"),
  public_id: Yup.string()
    .max(255, "Public ID quá dài") // Khớp max_length=255
    .required("Bắt buộc"),
  alt_text: Yup.string().max(200, "Mô tả không quá 200 ký tự").nullable(),
  la_anh_dai_dien: Yup.boolean().default(false),
});

// =================================================================
// 2. BIẾN THỂ (VARIANT)
// =================================================================

/**
 * JSDoc type cho BienTheSanPham (match BienTheSanPhamResponse Pydantic)
 * @typedef {Object} BienTheSanPhamResponse
 * @property {number} id
 * @property {number} san_pham_id
 * @property {string|null} [ten_bien_the]
 * @property {string} trang_thai_kich_hoat
 * @property {string} gia_ban (Decimal được gửi về dạng string)
 * @property {string|null} [gia_khuyen_mai]
 * @property {string|null} [ngay_bat_dau_khuyen_mai] (ISO date string)
 * @property {string|null} [ngay_ket_thuc_khuyen_mai] (ISO date string)
 * @property {number} so_luong_ton
 * @property {HinhAnhResponse[]} hinh_anhs
 */

// Yup schema cho BienTheCreate (match BienTheSanPhamCreate)
export const bienTheCreateSchema = Yup.object({
  ten_bien_the: Yup.string().max(100, "Tên không quá 100 ký tự").nullable(),
  trang_thai_kich_hoat: Yup.string()
    .oneOf(Object.values(TrangThaiSanPhamEnum))
    .default(TrangThaiSanPhamEnum.DANG_BAN),
  gia_ban: Yup.number()
    .positive("Giá bán phải lớn hơn 0") // Khớp gt=0
    .required("Giá bán là bắt buộc"),
  gia_khuyen_mai: Yup.number()
    .positive("Giá khuyến mãi phải lớn hơn 0") // Khớp gt=0
    .nullable()
    // Cho phép input là 0 hoặc rỗng (coi như null)
    .transform((value, originalValue) => {
      return originalValue === "" || originalValue === 0 ? null : value;
    }),
  ngay_bat_dau_khuyen_mai: Yup.date().nullable(), // Thêm trường
  ngay_ket_thuc_khuyen_mai: Yup.date() // Thêm trường
    .nullable()
    .when("ngay_bat_dau_khuyen_mai", (ngay_bat_dau_arr, schema) =>
      ngay_bat_dau_arr && ngay_bat_dau_arr[0] // Lấy giá trị từ mảng
        ? schema.min(ngay_bat_dau_arr[0], "Ngày kết thúc phải sau ngày bắt đầu")
        : schema
    ),
  so_luong_ton: Yup.number()
    .min(0, "Tồn kho không thể âm") // Khớp ge=0
    .integer("Tồn kho phải là số nguyên")
    .required("Số lượng tồn là bắt buộc"),
  hinh_anhs: Yup.array().of(hinhAnhCreateSchema).default([]),
});

// =================================================================
// 3. SẢN PHẨM (PRODUCT)
// =================================================================

/**
 * JSDoc type cho SanPham (match SanPhamResponse Pydantic)
 * @typedef {Object} SanPhamResponse
 * @property {number} id
 * @property {string} ma_san_pham
 * @property {number} danh_muc_id
 * @property {number} thuong_hieu_id
 * @property {string} ten_san_pham
 * @property {string|null} [mo_ta]
 * @property {Object|null} [thong_so_ky_thuat]
 * @property {string} trang_thai
 * @property {string|null} [ngay_tao] (ISO date string)
 *Â * @property {string|null} [ngay_cap_nhat] (ISO date string)
 * @property {DanhMucResponse} danh_muc
 * @property {ThuongHieuResponse} thuong_hieu
 * @property {BienTheSanPhamResponse[]} cac_bien_the
 */

/**
 * JSDoc type cho SanPhamListResponse (match Pydantic)
 * @typedef {Object} SanPhamListResponse
 * @property {SanPhamResponse[]} data
 * @property {Object} pagination
 * @property {number} pagination.page
 * @property {number} pagination.per_page
 * @property {number} pagination.total
 * @property {number} pagination.pages
 */

// Schema cho create SanPham (match SanPhamCreate)
/**
 * @typedef {Object} SanPhamCreate
 * @property {number} danh_muc_id
 * @property {number} thuong_hieu_id
 * @property {string} ten_san_pham
 * @property {string|null} [mo_ta]
 * @property {Object|null} [thong_so_ky_thuat]
 * @property {string|null} [trang_thai]
 * @property {Array<import("./sanPhamSchemas").BienTheCreate>|null} [bien_the_san_phams]
 */

// Yup schema cho SanPhamCreate
export const sanPhamCreateSchema = Yup.object({
  danh_muc_id: Yup.number().required("Danh mục là bắt buộc"),
  thuong_hieu_id: Yup.number().required("Thương hiệu là bắt buộc"),
  ten_san_pham: Yup.string()
    .max(200, "Tên không quá 200 ký tự") // Khớp max_length=200
    .required("Tên sản phẩm là bắt buộc"),
  mo_ta: Yup.string().nullable(),
  thong_so_ky_thuat: Yup.object().nullable(),
  trang_thai: Yup.string()
    .oneOf(Object.values(TrangThaiSanPhamEnum))
    .default(TrangThaiSanPhamEnum.DANG_BAN),
  // Khớp Pydantic (nhận 1 mảng bien_the_san_phams)
  bien_the_san_phams: Yup.array()
    .of(bienTheCreateSchema)
    .min(1, "Sản phẩm phải có ít nhất 1 biến thể")
    .default([]),
});

// Schema cho update SanPham (match SanPhamUpdate)
/**
 * @typedef {Object} SanPhamUpdate
 * @property {number|null} [danh_muc_id]
 * @property {number|null} [thuong_hieu_id]
 * @property {string|null} [ten_san_pham]
 * @property {string|null} [mo_ta]
 * @property {Object|null} [thong_so_ky_thuat]
 * @property {string|null} [trang_thai]
 */

// Yup schema cho SanPhamUpdate
// Lưu ý: Schema này không bao gồm biến thể, vì logic Sửa/Xóa biến thể
// được xử lý bằng các API riêng (useTaoBienThe, useCapNhatBienThe...)
export const sanPhamUpdateSchema = Yup.object({
  danh_muc_id: Yup.number().nullable(),
  thuong_hieu_id: Yup.number().nullable(),
  ten_san_pham: Yup.string().max(200, "Tên không quá 200 ký tự").nullable(),
  mo_ta: Yup.string().nullable(),
  thong_so_ky_thuat: Yup.object().nullable(),
  trang_thai: Yup.string()
    .oneOf([...Object.values(TrangThaiSanPhamEnum), null]) // Cho phép cả null
    .nullable(),
});
