// src/components/filters/CheckboxGroup.jsx
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CheckboxGroup({
  title,
  options = [],
  values = [],
  onChange = () => {},
  collapsible = true,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = (v) => {
    const set = new Set(values);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    onChange(Array.from(set));
  };

  return (
    <div className="py-1">
      {title && (
        <button
          type="button"
          className="w-full flex items-center justify-between font-medium text-sm text-slate-900"
          onClick={() => collapsible && setOpen((o) => !o)}
        >
          {title}
          {collapsible && (
            <ChevronDown
              size={16}
              className={`text-slate-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          )}
        </button>
      )}

      {(!collapsible || open) && (
        <div className="mt-1.5 space-y-1.5">
          {options.map((op) => (
            <label
              key={op.value}
              className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={values.includes(op.value)}
                onChange={() => toggle(op.value)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>{op.label}</span>
            </label>
          ))}
          {options.length === 0 && (
            <p className="text-xs text-slate-400">Chưa có dữ liệu.</p>
          )}
        </div>
      )}
    </div>
  );
}
