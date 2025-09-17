import React from "react";
import { Package, MoreHorizontal } from "lucide-react";
import ActionMenu from "./ActionMenu";

/**
 * TableRow
 * - Render từng dòng của bảng
 * - Icon kế bên tên có kích thước & màu phụ thuộc quantity
 * - Bỏ phần chấm tròn kế bên quantity
 */
const TableRow = ({ item, openMenuId, setOpenMenuId }) => {
    // Xác định màu / kích thước icon dựa trên quantity
    const getStockIndicator = (qty) => {
        if (qty > 3    )
            return { bg: "bg-green-500", label: "100%", iconSize: 20, iconColor: "text-green-500" };
        if (qty > 1)
            return { bg: "bg-yellow-500", label: "50%", iconSize: 18, iconColor: "text-yellow-500" };
        if (qty > 0)
            return { bg: "bg-orange-500", label: "20%", iconSize: 16, iconColor: "text-orange-500" };
        return { bg: "bg-red-500", label: "10%", iconSize: 14, iconColor: "text-red-500" };
    };

    const stock = getStockIndicator(item.quantity);

    // Mới: xác định status dựa trên quantity
    const status =
        item.quantity > 3 ? "In Stock" : item.quantity >= 1 ? "Low Stock" : "Out Stock";

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <td className="px-4 py-3 text-center text-blue-600 font-medium">{item.id}</td>
            <td className="px-4 py-3 flex items-center gap-2 text-left">
                <Package size={stock.iconSize} className={`${stock.iconColor}`} />
                {item.name}
            </td>
            <td className="px-4 py-3 text-center">{item.brand}</td>
            <td className="px-4 py-3 text-center">
                {item.quantity}
            </td>
            <td className="px-4 py-3 text-center">${item.price}</td>
            <td className="px-4 py-3 text-center">
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium
                        ${
                            status === "In Stock"
                                ? "bg-green-50 text-green-700"
                                : status === "Low Stock"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                        }`}
                >
                    {status}
                </span>
            </td>
            <td className="px-4 py-3 text-center relative">
                <button
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                >
                    <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
                {openMenuId === item.id && <ActionMenu onClose={() => setOpenMenuId(null)} />}
            </td>
        </tr>
    );
};

export default TableRow;
