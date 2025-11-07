// src/components/common/Inventory/AddProduct/VariantImageUpload.jsx
import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, XCircle, Loader2 } from "lucide-react";

const VariantImageUpload = ({
  images = [],
  onChange,
  readOnly = false,
  uploadProgress = {},
  placeholderImage,
}) => {
  const fileInputRef = useRef(null);
  const [localImages, setLocalImages] = useState([]);

  // Đồng bộ images từ props với state local
  useEffect(() => {
    console.log("VariantImageUpload - Images from props:", images);
    const validImages = (images || []).filter(
      (img) => img && (img.url || img.file)
    );
    setLocalImages(validImages);
  }, [images]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      alt_text: file.name,
      la_anh_dai_dien: false,
    }));

    const updatedImages = [...localImages, ...newImages];
    setLocalImages(updatedImages);

    if (onChange) {
      onChange(updatedImages);
    }

    event.target.value = null;
  };

  const handleRemove = (indexToRemove) => {
    console.log("Removing image at index:", indexToRemove);
    const imageToRemove = localImages[indexToRemove];

    if (imageToRemove.previewUrl) {
      URL.revokeObjectURL(imageToRemove.previewUrl);
    }

    const newImages = localImages.filter((_, index) => index !== indexToRemove);

    if (imageToRemove.la_anh_dai_dien && newImages.length > 0) {
      newImages[0].la_anh_dai_dien = true;
    }

    setLocalImages(newImages);

    if (onChange) {
      onChange(newImages);
    }
  };

  const setAsMainImage = (index) => {
    console.log("Setting image as main:", index);
    const newImages = localImages.map((img, i) => ({
      ...img,
      la_anh_dai_dien: i === index,
    }));

    setLocalImages(newImages);

    if (onChange) {
      onChange(newImages);
    }
  };

  const triggerFileSelect = () => !readOnly && fileInputRef.current?.click();

  // Dọn dẹp URL temp
  useEffect(() => {
    return () => {
      localImages.forEach((img) => {
        if (img.previewUrl) {
          URL.revokeObjectURL(img.previewUrl);
        }
      });
    };
  }, []);

  const getImageUrl = (image) => {
    if (image.previewUrl) return image.previewUrl;
    if (image.url) return image.url;
    return placeholderImage;
  };

  console.log("VariantImageUpload - Current localImages:", localImages);

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        disabled={readOnly}
      />

      <div className="flex items-center space-x-4">
        {!readOnly && (
          <button
            type="button"
            onClick={triggerFileSelect}
            disabled={readOnly}
            className="flex items-center justify-center px-4 py-2 font-semibold rounded-lg 
                       bg-gray-200 text-slate-700 hover:bg-gray-300
                       dark:bg-gray-600 dark:text-slate-200 dark:hover:bg-gray-500
                       transition-colors duration-300 shadow disabled:opacity-50"
          >
            <UploadCloud className="h-5 w-5 mr-2" />
            Chọn ảnh
          </button>
        )}

        {localImages.length > 0 && (
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Đã chọn {localImages.length} ảnh{" "}
            {localImages.some((img) => img.file) && "(Chưa upload)"}
          </p>
        )}
      </div>

      {localImages.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4 p-4 rounded-lg bg-black/5 dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-600">
          {localImages.map((image, index) => {
            const imageUrl = getImageUrl(image);
            const progressKey = `variant_${index}`;
            const isUploading = uploadProgress[progressKey] === "uploading";

            return (
              <div
                key={
                  image.public_id ||
                  image.previewUrl ||
                  image.url ||
                  `image_${index}`
                }
                className="relative group aspect-square"
              >
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-md">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <>
                    <img
                      src={imageUrl}
                      alt={image.alt_text || `Ảnh ${index + 1}`}
                      className={`w-full h-full object-cover rounded-md shadow-md ${
                        image.la_anh_dai_dien ? "ring-2 ring-emerald-500" : ""
                      }`}
                      onError={(e) => {
                        console.error("Lỗi tải ảnh:", imageUrl);
                        e.target.src = placeholderImage;
                      }}
                    />

                    {image.la_anh_dai_dien && (
                      <div className="absolute top-1 left-1 bg-emerald-500 text-white text-xs px-1 py-0.5 rounded">
                        Chính
                      </div>
                    )}

                    {image.file && !image.public_id && (
                      <div className="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                        Mới
                      </div>
                    )}

                    {!readOnly && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="absolute -top-2 -right-2 p-0.5 rounded-full flex items-center justify-center
                                   bg-red-500 text-white opacity-0 group-hover:opacity-100 
                                   transform group-hover:scale-110 transition-all duration-300"
                          aria-label="Remove image"
                        >
                          <XCircle className="h-6 w-6" />
                        </button>

                        {!image.la_anh_dai_dien && (
                          <button
                            type="button"
                            onClick={() => setAsMainImage(index)}
                            className="absolute bottom-1 left-1 right-1 bg-blue-500 text-white text-xs py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Đặt làm chính
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {localImages.length === 0 && !readOnly && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <UploadCloud className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Chưa có ảnh nào được chọn</p>
          <p className="text-sm mt-1">
            Ảnh sẽ được upload khi bạn lưu sản phẩm
          </p>
        </div>
      )}
    </div>
  );
};

export default VariantImageUpload;
