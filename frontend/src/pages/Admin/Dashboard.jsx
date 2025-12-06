// src/pages/Admin/Dashboard.jsx
import React from "react";
import StatusGrid from "../../components/common/Dashboard/StatusGrid";
import KhuVucBieuDo from "../../components/common/Dashboard/KhuVucBieuDo";

function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Hàng 1: thẻ thống kê nhanh */}
      <StatusGrid />

      {/* Hàng 2–3: Biểu đồ chi tiết + các thống kê khác */}
      <KhuVucBieuDo />
    </div>
  );
}

export default Dashboard;
