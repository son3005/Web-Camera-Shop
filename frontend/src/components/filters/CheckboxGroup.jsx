// frontend/src/components/filters/CheckboxGroup.jsx
// Group checkbox có tiêu đề + có thể thu gọn

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CheckboxGroup({
  title,
  options = [], // {value, label}
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
    <div className="border-b border-black/5 dark:border-white/10 py-3">
      <button
        type="button"
        className="w-full flex items-center justify-between font-medium text-sm text-gray-800 dark:text-slate-200"
        onClick={() => collapsible && setOpen((o) => !o)}
      >
        {title}
        {collapsible && (
          <ChevronDown
            size={16}
            className={`transition ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>
      {(!collapsible || open) && (
        <div className="mt-2 space-y-2">
          {options.map((op) => (
            <label
              key={op.value}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300"
            >
              <input
                type="checkbox"
                className="rounded border-gray-300 dark:border-slate-600"
                checked={values.includes(op.value)}
                onChange={() => toggle(op.value)}
              />
              {op.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
