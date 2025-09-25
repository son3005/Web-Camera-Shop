import React from 'react';
import StatsGrid from '../../components/common/Dashboard/StatusGrid';
import ChartSection from '../../components/common/Dashboard/ChartSection';
import TableSection from '../../components/common/Dashboard/TableSection';
import ActivityFeed from "../../components/common/Dashboard/ActivityFeed"

function Dashboard() {
    return (
        <div className='space-y-6'>
            {/* Hàng đầu tiên: Các ô thống kê */}
            <StatsGrid />

            {/* Hàng thứ hai: Các biểu đồ */}
            <ChartSection />

            {/* Hàng thứ ba: Bảng và luồng hoạt động */}
            <div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
                <div className='xl:col-span-2'>
                    <TableSection />
                </div>
                <div>
                    <ActivityFeed />
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
