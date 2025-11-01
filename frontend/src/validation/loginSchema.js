// validations/loginSchema.js
import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  mat_khau: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export const registerSchema = yup.object({
  ho_ten: yup.string().required("Phải nhập họ tên nhe 🫤"),
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
  mat_khau: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(30, "Mật khẩu tối đa chỉ được 30 ký tự"),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Email không hợp lệ")
    .required("Vui lòng nhập email"),
});

export const resetPasswordSchema = yup.object({
  mat_khau: yup
    .string()
    .required("Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .max(30, "Mật khẩu tối đa chỉ được 30 ký tự"),
});
