// frontend/src/components/product/ProductTabs.jsx
import { useState, useRef } from "react";
import ProductSpecsTable from "./ProductSpecsTable";
import { Star, Upload, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getReviews, submitReview } from "../../api/reviewsApi";

function TabButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition
        ${
          active
            ? "bg-black text-white dark:bg-emerald-600"
            : "bg-white text-gray-800 dark:bg-slate-800 dark:text-slate-100 border dark:border-slate-600"
        }`}
    >
      {children}
    </button>
  );
}

function RatingInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          title={`${i} sao`}
          className="p-1"
        >
          <Star
            size={36}
            className={
              i <= value
                ? "fill-amber-400 stroke-amber-400"
                : "stroke-amber-400"
            }
          />
        </button>
      ))}
      <div className="text-sm text-gray-600 dark:text-slate-300">
        {["Rất tệ", "Tệ", "Tạm ổn", "Tốt", "Rất tốt"][Math.max(value - 1, 0)] ||
          "Chọn đánh giá"}
      </div>
    </div>
  );
}

function ReviewForm({ productId }) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [willRecommend, setWillRecommend] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);
  const [images, setImages] = useState([]);
  const fileRef = useRef(null);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload) => submitReview(productId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      setContent("");
      setImages([]);
      setWillRecommend(false);
      setName("");
      setPhone("");
      setAgree(false);
    },
  });

  const addFiles = (files) => {
    const list = Array.from(files || []).slice(0, 3 - images.length);
    setImages((prev) => [...prev, ...list]);
  };

  const removeImg = (i) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  const canSubmit =
    rating > 0 && name.trim() && phone.trim() && agree && !isPending;

  return (
    <div className="surface-panel p-4 md:p-6">
      <div className="flex items-center gap-4">
        <RatingInput value={rating} onChange={setRating} />
      </div>

      <textarea
        className="ui-input mt-4 h-28"
        placeholder="Mời bạn chia sẻ thêm cảm nhận…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <label className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
        <input
          type="checkbox"
          className="accent-emerald-600"
          checked={willRecommend}
          onChange={(e) => setWillRecommend(e.target.checked)}
        />
        Tôi sẽ giới thiệu sản phẩm cho bạn bè, người thân
      </label>

      {/* Upload ảnh (tối đa 3) */}
      <div className="mt-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-outline inline-flex items-center gap-2"
          >
            <Upload size={18} />
            Gửi ảnh thực tế (tối đa 3 ảnh)
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        {images.length > 0 && (
          <div className="mt-3 flex gap-3 flex-wrap">
            {images.map((f, i) => {
              const url = typeof f === "string" ? f : URL.createObjectURL(f);
              return (
                <div key={i} className="relative w-20 h-20">
                  <img
                    src={url}
                    className="w-20 h-20 rounded-lg object-cover border dark:border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeImg(i)}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white"
                    title="Xoá"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Thông tin người gửi */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          className="ui-input"
          placeholder="Họ tên (bắt buộc)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="ui-input"
          placeholder="Số điện thoại (bắt buộc)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <label className="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200">
        <input
          type="checkbox"
          className="accent-emerald-600"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        Tôi đồng ý với{" "}
        <a href="#footer-policies" className="text-emerald-600 underline">
          Chính sách xử lý dữ liệu cá nhân
        </a>
      </label>

      <div className="mt-4">
        <button
          disabled={!canSubmit}
          onClick={() =>
            mutateAsync({
              rating,
              content,
              willRecommend,
              name,
              phone,
              images,
            })
          }
          className={`btn-emerald w-full md:w-auto ${
            !canSubmit ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? "Đang gửi…" : "Gửi đánh giá"}
        </button>
      </div>
    </div>
  );
}

function ReviewsList({ productId }) {
  const { data } = useQuery({
    queryKey: ["reviews", productId, 1],
    queryFn: () => getReviews(productId, { page: 1, limit: 10 }),
  });

  if (!data || data.items.length === 0) {
    return (
      <div className="text-sm text-gray-600 dark:text-slate-300">
        Chưa có đánh giá nào.
      </div>
    );
  }

  return (
    <ul className="mt-4 space-y-4">
      {data.items.map((rv) => (
        <li key={rv.id} className="surface-panel p-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={16}
                className={
                  i <= rv.rating
                    ? "fill-amber-400 stroke-amber-400"
                    : "stroke-amber-400"
                }
              />
            ))}
            <span className="text-xs text-gray-500 dark:text-slate-400 ml-2">
              {rv.name} • {new Date(rv.created_at).toLocaleDateString()}
            </span>
          </div>
          {rv.content && (
            <p className="mt-2 text-sm text-gray-800 dark:text-slate-100">
              {rv.content}
            </p>
          )}
          {rv.images?.length > 0 && (
            <div className="mt-2 flex gap-2">
              {rv.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  className="w-16 h-16 rounded-lg object-cover border dark:border-slate-700"
                />
              ))}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function ProductTabs({
  description,
  specs,
  reviews,
  productId,
}) {
  const [tab, setTab] = useState("overview");

  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-3 mb-4">
        <TabButton
          active={tab === "overview"}
          onClick={() => setTab("overview")}
        >
          Tổng quan
        </TabButton>
        <TabButton active={tab === "specs"} onClick={() => setTab("specs")}>
          Thông số kỹ thuật
        </TabButton>
        <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")}>
          Nhận xét & Đánh giá
        </TabButton>
      </div>

      {tab === "overview" && (
        <div className="surface-panel p-4 md:p-6">
          <div
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: description || "<p>Chưa có mô tả.</p>",
            }}
          />
        </div>
      )}

      {tab === "specs" && <ProductSpecsTable specs={specs} />}

      {tab === "reviews" && (
        <div className="space-y-6">
          <ReviewForm productId={productId} />
          <ReviewsList productId={productId} />
        </div>
      )}
    </section>
  );
}
