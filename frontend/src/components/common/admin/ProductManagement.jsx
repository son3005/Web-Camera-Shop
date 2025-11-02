// components/ProductManagement.jsx
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Download, FileText, Edit, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// API functions
const productApi = {
  getProducts: () => axios.get('/api/san-pham').then(res => res.data),
  deleteProduct: (id) => axios.delete(`/api/san-pham/${id}`),
  exportExcel: () => axios.get('/api/san-pham/export/excel', { responseType: 'blob' }),
  exportPDF: () => axios.get('/api/san-pham/export/pdf', { responseType: 'blob' })
};

const ProductManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productApi.getProducts
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: productApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Xóa sản phẩm thành công');
    },
    onError: () => toast.error('Lỗi khi xóa sản phẩm')
  });

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!productsData?.data) return [];
    
    return productsData.data.filter(product => 
      product.ten_san_pham.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.ma_san_pham.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productsData, searchTerm]);

  // Calculate product stats
  const getProductStats = (product) => {
    const variants = product.cac_bien_the || [];
    const prices = variants.map(v => parseFloat(v.gia_ban));
    const totalStock = variants.reduce((sum, v) => sum + v.so_luong_ton, 0);
    
    return {
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      totalStock
    };
  };

  // Export handlers
  const handleExportExcel = async () => {
    try {
      const response = await productApi.exportExcel();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'san-pham.xlsx');
      document.body.appendChild(link);
      link.click();
      toast.success('Xuất Excel thành công');
    } catch (error) {
      toast.error('Lỗi khi xuất Excel');
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await productApi.exportPDF();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'san-pham.pdf');
      document.body.appendChild(link);
      link.click();
      toast.success('Xuất PDF thành công');
    } catch (error) {
      toast.error('Lỗi khi xuất PDF');
    }
  };

  // Action handlers
  const handleViewDetail = (product) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      deleteMutation.mutate(productId);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header với search và actions */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Quản lý Sản phẩm</h1>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm SP
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã SP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thương hiệu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá (Min - Max)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng tồn kho
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stats = getProductStats(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.ma_san_pham}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {product.ten_san_pham}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.danh_muc.ten_danh_muc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.thuong_hieu.ten_thuong_hieu}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(stats.minPrice)} - {formatPrice(stats.maxPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {stats.totalStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-green-600 hover:text-green-900"
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy sản phẩm nào
          </div>
        )}
      </div>

      {/* Modals */}
      {isDetailModalOpen && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <ProductEditModal
          product={selectedProduct}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updatedProduct) => {
            // Handle save logic
            setIsEditModalOpen(false);
          }}
        />
      )}

      {isAddModalOpen && (
        <ProductAddModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newProduct) => {
            // Handle add logic
            setIsAddModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ProductManagement;