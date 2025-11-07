// src/components/product/ProductSpecsTable.jsx
// Hiển thị toàn bộ thong_so_ky_thuat dạng key/value (phẳng)

export default function ProductSpecsTable({ specs }) {
  if (!specs || Object.keys(specs).length === 0) return null;

  const entries = Object.entries(specs);
  const nice = (s = "") =>
    s
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg">
      <table className="min-w-full text-sm text-left border-collapse">
        <tbody>
          {entries.map(([k, v]) => (
            <tr
              key={k}
              className="border-b border-gray-200 dark:border-slate-700"
            >
              <td className="px-4 py-2 w-1/3 text-slate-700 dark:text-slate-300">
                {nice(k)}
              </td>
              <td className="px-4 py-2 font-medium text-slate-900 dark:text-slate-100">
                {String(v ?? "—")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
