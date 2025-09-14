import React from "react";
import RevenueChart from "./RevenueChart"

function ChartSection()
{
    return(
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
                <RevenueChart/>
            </div>
        </div>
    )
}

export default ChartSection