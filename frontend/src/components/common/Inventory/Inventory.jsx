import React, { useState } from "react";
import { Search, Plus, ChevronLeft, ChevronRight, Download } from "lucide-react";
import TableRow from "./TableRow";
import ExportMenu from "./ExportMenu";
import AddProductModal from "./AddProduct/AddProductModal";




const initialData  = [
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
  const [products, setProducts] = useState(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [goToPage, setGoToPage] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [modalData, setModalData] = useState(null);

  const handleDelete = (id) => setProducts((prev) => prev.filter((p) => p.id !== id));
  const handleView = (product) => { setModalData(product); setModalMode("view"); };
  const handleEdit = (product) => { setModalData(product); setModalMode("edit"); };
  const handleAdd = () => { setModalData(null); setModalMode("add"); };
  const handleSave = (form) => {
    if (modalMode === "add") {
      const maxNum = products.reduce((acc, p) => Math.max(acc, parseInt(p.id.replace(/[^\d]/g, "")) || 0), 0);
      const newId = "P" + String(maxNum + 1).padStart(3, "0");
      const price = form.variants?.[0]?.price || 0;
      const qty = form.variants?.reduce((s, v) => s + (Number(v.quantity) || 0), 0) || 0;
      const newProduct = { id: newId, name: form.name, brand: form.brand, quantity: qty, price: price, full: form };
      setProducts((prev) => [newProduct, ...prev]);
    } else if (modalMode === "edit") {
      const price = form.variants?.[0]?.price || 0;
      const qty = form.variants?.reduce((s, v) => s + (Number(v.quantity) || 0), 0) || 0;
      setProducts((prev) => prev.map((p) => p.id === form.id ? { ...p, name: form.name, brand: form.brand, quantity: qty, price: price, full: form } : p));
    }
    setModalMode(null); setModalData(null);
  };

  const filteredData = products.filter(
    (item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const handleGoToPage = (e) => {
      e.preventDefault();
      const num = parseInt(goToPage);
      if (num >= 1 && num <= totalPages) {
          setCurrentPage(num);
      }
      setGoToPage("");
  };

  const primaryButtonStyles = "flex items-center justify-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-lg bg-gradient-to-br from-emerald-600 to-slate-800 hover:from-emerald-500 hover:to-slate-700 dark:from-emerald-500 dark:to-slate-700 dark:hover:from-emerald-400 dark:hover:to-slate-600 transition-all duration-300 shadow-md hover:shadow-lg";
  const secondaryButtonStyles = "flex items-center justify-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 hover:from-slate-500 hover:to-slate-700 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 transition-colors duration-300 shadow";

  return (
    <div className="w-full">
      {modalMode && <AddProductModal onClose={() => { setModalMode(null); setModalData(null); }} mode={modalMode} product={modalData} onSave={handleSave} />}

      <div className="w-full mx-auto bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-b border-black/10 dark:border-white/10">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Quản lý kho hàng</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-grow sm:flex-grow-0">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Tìm kiếm sản phẩm..." className="w-full sm:w-64 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="relative">
                <button className={secondaryButtonStyles} onClick={() => setExportOpen((s) => !s)}>
                    <Download size={16} /> <span>Export</span>
                </button>
                {exportOpen && <ExportMenu onClose={() => setExportOpen(false)} />}
            </div>
            <button className={`${primaryButtonStyles} hover:scale-105`} onClick={handleAdd}>
              <Plus size={18} /> <span>Thêm sản phẩm</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
             <thead className="bg-black/5 dark:bg-white/5">
              <tr>
                {["ID", "Sản phẩm", "Thương hiệu", "Số lượng", "Giá", "Trạng thái", "Hành động"].map((header, i) => (
                  <th key={i} className={`px-4 py-3 font-bold text-slate-800 dark:text-slate-300 uppercase tracking-wider text-xs ${header === 'Sản phẩm' ? 'text-left' : 'text-center'}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => ( <TableRow key={item.id} item={item} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} onDelete={handleDelete} onView={handleView} onEdit={handleEdit} /> ))}
              {Array.from({ length: ITEMS_PER_PAGE - paginatedData.length }).map((_, idx) => ( <tr key={`empty-${idx}`} className="border-b border-black/5 dark:border-white/5 h-[69px]"><td colSpan="7"></td></tr> ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-slate-800 dark:text-slate-400 font-medium">Hiển thị {paginatedData.length} trên tổng số {filteredData.length} sản phẩm</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <ChevronLeft size={20} /> </button>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200"> Trang {currentPage} / {totalPages} </span>
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"> <ChevronRight size={20} /> </button>
            </div>
            <form onSubmit={handleGoToPage} className="flex items-center gap-2">
                <input type="number" min="1" max={totalPages} value={goToPage} onChange={(e) => setGoToPage(e.target.value)} className="w-16 px-2 py-1.5 bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 rounded-lg text-sm text-center text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Trang"/>
                <button type="submit" className={secondaryButtonStyles}>Go</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;