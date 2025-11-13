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
    <div className="py-3">
      {title && (
        <button
          type="button"
          className="w-full flex items-center justify-between font-medium text-sm text-slate-200"
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
      )}

      {(!collapsible || open) && (
        <div className="mt-2 space-y-2">
          {options.map((op) => (
            <label key={op.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
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
