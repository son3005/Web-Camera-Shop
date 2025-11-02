import * as yup from "yup";

// Schema cho HinhAnh (tuong ung HinhAnhCreate)
const hinhAnhSchema = yup.object().shape({
  url: yup.string().url("URL khong hop le").required("URL la bat buoc"),
  public_id: yup.string().required("Public ID la bat buoc"),
  alt_text: yup.string().max(200, "Toi da 200 ky tu"),
  la_anh_dai_dien: yup.boolean().default(false),
});

// Schema cho BienThe (tuong ung BienTheSanPhamCreate)
const bienTheSchema = yup.object().shape({
  // BienTheSanPhamUpdate (schema backend) khong co ID,
  // nhung service lai can ID. Ta them ID o day de quan ly o frontend
  id: yup.number().nullable(),

  ten_bien_the: yup.string().max(100, "Toi da 100 ky tu").nullable(),
  gia_ban: yup
    .number()
    .typeError("Gia ban phai la so")
    .positive("Gia ban phai > 0")
    .required("Gia ban la bat buoc"),
  gia_khuyen_mai: yup
    .number()
    .typeError("Gia phai la so")
    .positive("Gia phai > 0")
    .nullable()
    // Kiem tra gia KM phai nho hon gia ban
    .lessThan(yup.ref("gia_ban"), "Gia KM phai nho hon gia ban"),
  so_luong_ton: yup
    .number()
    .typeError("So luong phai la so")
    .min(0, "So luong phai >= 0")
    .integer("So luong phai la so nguyen")
    .required("So luong ton la bat buoc"),

  // Dung cho form update
  new_hinh_anhs: yup.array().of(hinhAnhSchema),
  deleted_hinh_anh_ids: yup.array().of(yup.number()),

  // Dung cho form create
  hinh_anhs: yup.array().of(hinhAnhSchema),
});

// Schema cho SanPham (tuong ung SanPhamCreate va SanPhamUpdate)
export const sanPhamSchema = yup.object().shape({
  ten_san_pham: yup
    .string()
    .max(200, "Toi da 200 ky tu")
    .required("Ten san pham la bat buoc"),
  danh_muc_id: yup
    .number()
    .typeError("Vui long chon danh muc")
    .required("Vui long chon danh muc"),
  thuong_hieu_id: yup
    .number()
    .typeError("Vui long chon thuong hieu")
    .required("Vui long chon thuong hieu"),
  mo_ta: yup.string().nullable(),
  thong_so_ky_thuat: yup.object().nullable(), // Co the lam ky hon neu can

  // Khi tao moi
  bien_the_san_phams: yup
    .array()
    .of(bienTheSchema)
    .min(1, "Phai co it nhat 1 bien the")
    .required(),

  // Khi cap nhat
  cac_bien_the: yup.array().of(bienTheSchema),
});
