import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPhieuThuList } from "../../api/phieuThuApi";
import PhieuThuTable from "../../components/common/admin/PhieuThuTable";

export default function PhieuThuList() {
  const [page, setPage] = useState(1);
  const perPage = 10;
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["phieu-thu", page, perPage],
    queryFn: () => getPhieuThuList({ page, per_page: perPage }),
    keepPreviousData: true,
  });

  if (isLoading) return <div className="p-6 text-center">Đang tải...</div>;
  if (isError) return <div className="p-6 text-center text-red-500">Lỗi tải dữ liệu</div>;

  const handleView = (id) => navigate(`/admin/phieu-thu/${id}`);
  const phieuThus = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          Quản lý Phiếu Thu
        </h1>
        <button
          onClick={() => navigate("/admin/phieu-thu/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Tạo Phiếu Thu
        </button>
      </div>

      <PhieuThuTable data={phieuThus} onView={handleView} />
    </div>
  );
}
