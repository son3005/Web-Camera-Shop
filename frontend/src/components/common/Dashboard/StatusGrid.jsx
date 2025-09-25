import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
    ArrowDownRight, ArrowUpRight, DollarSign, LucideEye, 
    LucideShoppingCart, Users 
} from "lucide-react";
import { fetchDashboardStats } from "../../../api/dashboardApi"; // THÊM: Import API

// THÊM: Tạo một object để map string tên icon sang component thật
const iconComponents = {
    DollarSign,
    Users,
    LucideShoppingCart,
    LucideEye
};

function StatsGrid() {
    // THÊM: Logic gọi API bằng useQuery
    const { data: stats, isLoading, isError, error } = useQuery({
        queryKey: ['dashboardStats'], // Key định danh cho query này
        queryFn: fetchDashboardStats  // Hàm sẽ được gọi để fetch dữ liệu
    });

    // THÊM: Xử lý trạng thái loading
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Tạo 4 skeleton loader */}
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl animate-pulse">
                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }
    
    // THÊM: Xử lý trạng thái lỗi
    if (isError) {
        return <div className="text-red-500">Error fetching stats: {error.message}</div>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {/* CHỈNH SỬA: Dùng dữ liệu `stats` từ API */}
           {stats?.map((stat, index) => {
            // Lấy component icon tương ứng từ object `iconComponents`
            const IconComponent = iconComponents[stat.icon];

            return (
            <div key={index}
            className="group bg-slate-50 dark:bg-slate-800 backdrop-blur-xl
            border border-slate-200/50 dark:border-slate-700/50
            rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
            >
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col space-y-2">
                            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {stat.title}
                            </h3>
                            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                                {stat.value}
                            </p>
                            <div className="flex items-center space-x-1">
                                {stat.trend === "up" ?
                                <ArrowUpRight className="w-4 h-4 text-emerald-500"/> :
                                <ArrowDownRight className="w-4 h-4 text-red-500"/>}
                                <span className={`text-sm font-semibold ${
                                    stat.trend === "up" ? "text-emerald-500" : "text-red-500"}`}>
                                        {stat.change}
                                </span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                    vs Last month
                                </span>
                            </div>
                        </div>

                        <div 
                        className={`w-12 h-12 p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-all duration-300`}>
                            {/* Render component icon đã lấy được */}
                            {IconComponent && <IconComponent className={`w-6 h-6 ${stat.textColor}`} />}
                        </div>
                    </div>
                        <div className="mt-4 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={`bg-gradient-to-r ${stat.color} rounded-full transition-all duration-100 h-2`}
                                style={{ width: stat.trend === "up" ? "75%" : "45%" }}
                            >
                            </div>
                        </div>
                    
            </div>
            )
           })}
        </div>
    );
}

export default StatsGrid;