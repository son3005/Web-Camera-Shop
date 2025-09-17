import React, { useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, Download } from "lucide-react";
import TableRow from "./TableRow";
import ExportMenu from "./ExportMenu";
import AddProductModal from "./AddProduct/AddProductModal";




const inventoryData = [
    { id: "P001", name: "Canon EOS R5", brand: "Canon", quantity: 12, price: 3899 },
    { id: "P002", name: "Sony A7 IV", brand: "Sony", quantity: 8, price: 2499 },
    { id: "P003", name: "Nikon Z6 II", brand: "Nikon", quantity: 0, price: 1999 },
    { id: "P004", name: "Fujifilm X-T4", brand: "Fujifilm", quantity: 15, price: 1699 },
    { id: "P005", name: "Canon EOS R6", brand: "Canon", quantity: 3, price: 2499 },
    { id: "P006", name: "Sony A7S III", brand: "Sony", quantity: 10, price: 3499 },
    { id: "P007", name: "Nikon Z7 II", brand: "Nikon", quantity: 6, price: 2999 },
    { id: "P008", name: "Panasonic GH5", brand: "Panasonic", quantity: 0, price: 1499 },
    { id: "P009", name: "Canon EOS 90D", brand: "Canon", quantity: 18, price: 1199 },
    { id: "P010", name: "Sony A6600", brand: "Sony", quantity: 9, price: 1399 },
    { id: "P011", name: "Nikon D850", brand: "Nikon", quantity: 5, price: 2799 },
    { id: "P012", name: "Fujifilm X-S10", brand: "Fujifilm", quantity: 7, price: 999 },
    { id: "P013", name: "Canon EOS RP", brand: "Canon", quantity: 0, price: 999 },
    { id: "P014", name: "Sony A7C", brand: "Sony", quantity: 11, price: 1799 },
    { id: "P015", name: "Nikon Z5", brand: "Nikon", quantity: 0, price: 1299 },
    { id: "P016", name: "Panasonic S5", brand: "Panasonic", quantity: 8, price: 1999 },
    { id: "P017", name: "Canon M50 II", brand: "Canon", quantity: 20, price: 599 },
    { id: "P018", name: "Sony ZV-1", brand: "Sony", quantity: 14, price: 749 },
    { id: "P019", name: "Nikon Z50", brand: "Nikon", quantity: 0, price: 859 },
    { id: "P020", name: "Fujifilm X-E4", brand: "Fujifilm", quantity: 6, price: 849 },
    { id: "P021", name: "Canon R3", brand: "Canon", quantity: 5, price: 5999 },
    { id: "P022", name: "Sony A1", brand: "Sony", quantity: 0, price: 6499 },
    { id: "P023", name: "Nikon Z9", brand: "Nikon", quantity: 4, price: 5499 },
    { id: "P024", name: "Panasonic GH6", brand: "Panasonic", quantity: 7, price: 2199 },
    { id: "P025", name: "Canon R7", brand: "Canon", quantity: 13, price: 1499 },
    { id: "P026", name: "Sony A7R V", brand: "Sony", quantity: 6, price: 3899 },
    { id: "P027", name: "Nikon Z30", brand: "Nikon", quantity: 9, price: 709 },
    { id: "P028", name: "Fujifilm X-H2", brand: "Fujifilm", quantity: 4, price: 1999 }
];


const ITEMS_PER_PAGE = 10;

const Inventory = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [goToPage, setGoToPage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);

  // 👇 thêm state để toggle giữa Inventory và AddProductModal
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Filter
  const filteredData = inventoryData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Fill dòng trống
  while (paginatedData.length < ITEMS_PER_PAGE) {
    paginatedData.push({
      id: "",
      name: "",
      brand: "",
      quantity: "",
      price: "",
      status: "",
      empty: true,
    });
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Nếu đang mở AddProduct thì hiển thị form */}
      {showAddProduct ? (
        <AddProductModal onClose={() => setShowAddProduct(false)} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-b dark:border-gray-700">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Inventory Management
            </h1>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg flex-1 sm:flex-initial">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none flex-1 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Export */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                  onClick={() => setExportOpen(!exportOpen)}
                >
                  <Download size={16} /> Export
                </button>
                {exportOpen && <ExportMenu onClose={() => setExportOpen(false)} />}
              </div>

              {/* Add Product */}
              <button
                className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                onClick={() => setShowAddProduct(true)} // 👈 bật form AddProduct
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b bg-gray-50 dark:bg-gray-700">
                  <th className="px-4 py-3 text-center w-[10%]">ID</th>
                  <th className="px-4 py-3 text-left w-[25%]">Product</th>
                  <th className="px-4 py-3 text-center w-[15%]">Brand</th>
                  <th className="px-4 py-3 text-center w-[10%]">Qty</th>
                  <th className="px-4 py-3 text-center w-[15%]">Price</th>
                  <th className="px-4 py-3 text-center w-[15%]">Status</th>
                  <th className="px-4 py-3 text-center w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, idx) =>
                  item.empty ? (
                    <tr key={idx}>
                      <td colSpan="7" className="h-[48px]"></td>
                    </tr>
                  ) : (
                    <TableRow
                      key={item.id}
                      item={item}
                      openMenuId={openMenuId}
                      setOpenMenuId={setOpenMenuId}
                    />
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-4 border-t flex justify-between items-center dark:border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-white rounded bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-white rounded bg-gradient-to-r from-blue-500 to-purple-600 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const num = parseInt(goToPage);
                if (num >= 1 && num <= totalPages) setCurrentPage(num);
                setGoToPage("");
              }}
              className="flex items-center gap-2"
            >
              <input
                type="number"
                min="1"
                max={totalPages}
                value={goToPage}
                onChange={(e) => setGoToPage(e.target.value)}
                className="w-16 px-2 py-1 border rounded text-sm"
                placeholder="Page"
              />
              <button
                type="submit"
                className="px-4 py-1.5 text-white text-sm rounded bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;