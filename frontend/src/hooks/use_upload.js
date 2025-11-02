// src/hooks/useUpload.js
import { useMutation } from "@tanstack/react-query";
import { lay_signature_upload, upload_anh_server } from "../api/upload";
import { toast } from "react-hot-toast";

export const useLaySignature = () => {
  return useMutation({
    mutationFn: lay_signature_upload,
    onSuccess: () => toast.success("Lấy chữ ký upload thành công"),
    onError: () => toast.error("Lỗi lấy chữ ký upload"),
  });
};

export const useUploadServer = () => {
  return useMutation({
    mutationFn: upload_anh_server,
    onSuccess: () => toast.success("Upload ảnh thành công"),
    onError: () => toast.error("Lỗi upload ảnh qua server"),
  });
};
