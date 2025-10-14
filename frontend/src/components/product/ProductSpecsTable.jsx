// frontend/src/components/product/ProductSpecsTable.jsx
// Hiển thị thông số kỹ thuật dưới dạng bảng, đồng bộ dark/light theme

export default function ProductSpecsTable({ specs }) {
  if (!specs || Object.keys(specs).length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Thông số kỹ thuật
      </h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg">
        <table className="min-w-full text-sm text-left border-collapse">
          <tbody>
            {Object.entries(specs).map(([groupKey, groupData]) => (
              <>
                {/* Nhóm thuộc tính */}
                <tr key={groupKey} className="bg-gray-100 dark:bg-slate-800/60">
                  <td
                    colSpan="2"
                    className="px-4 py-3 font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide"
                  >
                    {groupKey.replace(/_/g, " ")}
                  </td>
                </tr>
                {/* Các thuộc tính con */}
                {Object.entries(groupData || {}).map(([key, value]) => (
                  <tr
                    key={`${groupKey}-${key}`}
                    className="border-b border-gray-200 dark:border-slate-700"
                  >
                    <td className="px-4 py-2 text-gray-700 dark:text-slate-200 capitalize w-1/3">
                      {key.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-2 text-gray-900 dark:text-slate-100">
                      {value || "—"}
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
