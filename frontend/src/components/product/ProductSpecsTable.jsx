// src/components/product/ProductSpecsTable.jsx
// Bảng thông số kiểu LIGHT modern

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
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-md">
      <table className="min-w-full text-sm text-left">
        <tbody>
          {entries.map(([k, v], index) => (
            <tr
              key={k}
              className={`
                border-b border-slate-200 
                ${index % 2 === 0 ? "bg-slate-50/50" : "bg-white"}
              `}
            >
              <td className="px-4 py-2 w-1/3 text-slate-600 font-medium">
                {nice(k)}
              </td>
              <td className="px-4 py-2 text-slate-900 font-semibold">
                {String(v ?? "—")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
