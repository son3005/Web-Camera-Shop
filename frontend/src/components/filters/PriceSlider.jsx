// src/components/filters/PriceSlider.jsx
// Thanh chọn khoảng giá đơn giản (2 range + vài preset)

export default function PriceSlider({ value, onChange }) {
  const min = value?.min ?? 0;
  const max = value?.max ?? 66_000_000;

  const fmt = (v) =>
    (v || 0).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + "đ";

  return (
    <div>
      <div className="flex justify-between text-xs font-medium mb-1 text-slate-700">
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={66_000_000}
          step={1_000_000}
          value={min}
          onChange={(e) => onChange({ min: +e.target.value, max })}
          className="w-full accent-emerald-600"
        />
        <input
          type="range"
          min={0}
          max={66_000_000}
          step={1_000_000}
          value={max}
          onChange={(e) => onChange({ min, max: +e.target.value })}
          className="w-full accent-emerald-600"
        />
      </div>

      {/* quick chips */}
      <div className="grid grid-cols-2 gap-3 mt-4 text-slate-800">
        {[
          { label: "≤ 10 triệu", v: { min: 0, max: 10_000_000 } },
          { label: "10 – 20 triệu", v: { min: 10_000_000, max: 20_000_000 } },
          { label: "20 – 40 triệu", v: { min: 20_000_000, max: 40_000_000 } },
          { label: "≥ 40 triệu", v: { min: 40_000_000, max: 66_000_000 } },
        ].map((o) => (
          <button
            key={o.label}
            onClick={() => onChange(o.v)}
            className="px-3 py-2 rounded-lg border text-sm border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 transition"
          >
            {o.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => onChange({ min: 0, max: 66_000_000 })}
        className="w-full mt-3 text-sm font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
      >
        Đặt lại (Tất cả)
      </button>
    </div>
  );
}
