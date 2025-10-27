// frontend/src/components/filters/PriceSlider.jsx
// Thanh kéo giá 2 tay cầm – đẹp, mượt, có tooltip & preset
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

const VND = new Intl.NumberFormat("vi-VN").format;

// Giá trị mặc định
const RANGE_MIN = 0;
const RANGE_MAX = 66_000_000;
const STEP = 500_000;

export default function PriceSlider({
  value = { min: RANGE_MIN, max: RANGE_MAX },
  onChange = () => {},
  min = RANGE_MIN,
  max = RANGE_MAX,
  step = STEP,
}) {
  const [local, setLocal] = useState({
    min: Math.max(min, value.min ?? min),
    max: Math.min(max, value.max ?? max),
  });
  const [dragging, setDragging] = useState(null); // 'min' | 'max' | null
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef();

  // clamp để 2 tay không chồng lên nhau
  const clamp = (val, low, high) => Math.min(Math.max(val, low), high);

  // phần trăm hiển thị dải đã chọn
  const perc = useMemo(() => {
    const minP = ((local.min - min) / (max - min)) * 100;
    const maxP = ((local.max - min) / (max - min)) * 100;
    return { minP, maxP };
  }, [local, min, max]);

  // Debounce: chỉ đẩy URL/filter sau khi dừng kéo 250ms
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      // dùng transition để nhẹ UI
      startTransition(() => onChange({ min: local.min, max: local.max }));
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [local, onChange, startTransition]);

  // Preset nhanh
  const applyPreset = (minV, maxV) => {
    setLocal({
      min: minV ?? min,
      max: maxV ?? max,
    });
  };

  // Khi props value đổi (do load URL), sync local
  useEffect(() => {
    setLocal({
      min: clamp(value.min ?? min, min, max),
      max: clamp(value.max ?? max, min, max),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.min, value.max, min, max]);

  return (
    <div className="select-none">
      {/* dải hiện giá */}
      <div className="flex items-center justify-between text-xs font-medium mb-2">
        <span className="text-gray-600 dark:text-slate-300">
          {VND(local.min)}đ
        </span>
        <span className="text-gray-600 dark:text-slate-300">
          {VND(local.max)}đ
        </span>
      </div>

      {/* Slider container */}
      <div className="relative h-8">
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 h-2 w-full rounded-full bg-gray-200 dark:bg-slate-700" />

        {/* Progress (đoạn đã chọn) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2 rounded-full bg-emerald-500/90 shadow-inner"
          style={{
            left: `${perc.minP}%`,
            right: `${100 - perc.maxP}%`,
          }}
        />

        {/* Thumb MIN */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={local.min}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocal((s) => ({
              min: clamp(v, min, s.max - step),
              max: s.max,
            }));
          }}
          onMouseDown={() => setDragging("min")}
          onTouchStart={() => setDragging("min")}
          onMouseUp={() => setDragging(null)}
          onTouchEnd={() => setDragging(null)}
          className="absolute pointer-events-auto appearance-none w-full h-8 bg-transparent
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white dark:[&::-webkit-slider-thumb]:bg-slate-200
            [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-300 dark:[&::-webkit-slider-thumb]:border-slate-500
            [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-runnable-track]:appearance-none
            [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent"
          style={{
            // để thumb nằm trên progress
            zIndex: dragging === "min" ? 20 : 10,
          }}
          aria-label="Giá tối thiểu"
        />

        {/* Thumb MAX */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={local.max}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocal((s) => ({
              min: s.min,
              max: clamp(v, s.min + step, max),
            }));
          }}
          onMouseDown={() => setDragging("max")}
          onTouchStart={() => setDragging("max")}
          onMouseUp={() => setDragging(null)}
          onTouchEnd={() => setDragging(null)}
          className="absolute pointer-events-auto appearance-none w-full h-8 bg-transparent
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white dark:[&::-webkit-slider-thumb]:bg-slate-200
            [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-gray-300 dark:[&::-webkit-slider-thumb]:border-slate-500
            [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-runnable-track]:appearance-none
            [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:bg-transparent"
          style={{
            zIndex: dragging === "max" ? 20 : 10,
          }}
          aria-label="Giá tối đa"
        />

        {/* Tooltip khi kéo */}
        {dragging && (
          <div
            className="absolute -top-6 px-2 py-0.5 rounded bg-black text-white text-[11px] font-semibold"
            style={{
              left: `${dragging === "min" ? perc.minP : perc.maxP}%`,
              transform: "translateX(-50%)",
            }}
          >
            {VND(dragging === "min" ? local.min : local.max)}đ
          </div>
        )}
      </div>

      {/* Presets nhanh */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="btn-ghost !py-1.5 rounded-lg"
          onClick={() => applyPreset(min, 10_000_000)}
        >
          ≤ 10 triệu
        </button>
        <button
          type="button"
          className="btn-ghost !py-1.5 rounded-lg"
          onClick={() => applyPreset(10_000_000, 20_000_000)}
        >
          10 – 20 triệu
        </button>
        <button
          type="button"
          className="btn-ghost !py-1.5 rounded-lg"
          onClick={() => applyPreset(20_000_000, 40_000_000)}
        >
          20 – 40 triệu
        </button>
        <button
          type="button"
          className="btn-ghost !py-1.5 rounded-lg"
          onClick={() => applyPreset(40_000_000, max)}
        >
          ≥ 40 triệu
        </button>
        <button
          type="button"
          className="col-span-2 btn-outline !py-1.5 rounded-lg"
          onClick={() => applyPreset(min, max)}
          disabled={isPending}
        >
          Đặt lại (Tất cả)
        </button>
      </div>
    </div>
  );
}
