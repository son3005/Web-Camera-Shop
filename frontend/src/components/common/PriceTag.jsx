// frontend/src/components/common/PriceTag.jsx
// Hiển thị giá + giá gốc (nếu có) theo giao diện hiện đại

export default function PriceTag({
  price = 0,
  compareAt = null,
  className = "",
}) {
  // format tiền
  const fmt = (v) =>
    Number(v || 0).toLocaleString("vi-VN", {
      maximumFractionDigits: 0,
    }) + " ₫";

  const showCompare = compareAt && Number(compareAt) > Number(price);

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      {/* Giá hiện tại */}
      <span className="text-emerald-600 font-bold tracking-[0.3px]">
        {fmt(price)}
      </span>

      {/* Giá gốc */}
      {showCompare && (
        <span className="text-xs line-through text-slate-400 tracking-tight">
          {fmt(compareAt)}
        </span>
      )}
    </div>
  );
}
