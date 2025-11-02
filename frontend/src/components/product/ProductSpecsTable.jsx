// frontend/src/components/product/ProductSpecsTable.jsx
// Bảng thông số kỹ thuật: theo nhóm (Lighting, Image, Video, ...)
// Tương thích dark/light & không lệch cột

import React from "react";

function niceLabel(s = "") {
  const t = String(s).replaceAll("_", " ").trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const GROUP_ORDER = [
  "lighting",
  "image",
  "video",
  "focus",
  "viewfinder_monitor",
  "flash",
  "connectivity",
  "other",
];

export default function ProductSpecsTable({ specs }) {
  if (!specs || Object.keys(specs).length === 0) return null;

  const groupKeys = Object.keys(specs);
  const ordered = [
    ...GROUP_ORDER.filter((g) => groupKeys.includes(g)),
    ...groupKeys.filter((g) => !GROUP_ORDER.includes(g)),
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg">
      <table className="min-w-full text-sm text-left border-collapse">
        <tbody>
          {ordered.map((groupKey) => {
            const entries = Object.entries(specs[groupKey] || {});
            if (!entries.length) return null;

            return (
              <React.Fragment key={groupKey}>
                {/* Header nhóm */}
                <tr className="bg-gray-100 dark:bg-slate-800/60">
                  <td
                    colSpan={2}
                    className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide"
                  >
                    {niceLabel(groupKey)}
                  </td>
                </tr>

                {/* Các dòng key/value */}
                {entries.map(([k, v]) => (
                  <tr
                    key={`${groupKey}-${k}`}
                    className="border-b border-gray-200 dark:border-slate-700"
                  >
                    <td className="px-4 py-2 w-1/3 text-slate-700 dark:text-slate-300">
                      {niceLabel(k)}
                    </td>
                    <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                      {String(v ?? "—")}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
