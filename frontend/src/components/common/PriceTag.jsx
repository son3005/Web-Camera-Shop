// frontend/src/components/common/PriceTag.jsx
// Hiển thị giá hiện tại + giá gốc (gạch) + tự format VND
export default function PriceTag({
  price = 0,
  compareAt = null,
  className = "",
}) {
  const fmt = (v) => Number(v || 0).toLocaleString("vi-VN") + "₫";
  const showCompare = compareAt && Number(compareAt) > Number(price);

  return (
    <div className={`flex items-baseline gap-2 ${className}`}>
      <span className="text-red-600 dark:text-rose-400 font-bold">
        {fmt(price)}
      </span>
      {showCompare && (
        <span className="text-xs line-through text-gray-400">
          {fmt(compareAt)}
        </span>
      )}
    </div>
  );
}
