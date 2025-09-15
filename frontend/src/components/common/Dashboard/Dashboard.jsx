import React from 'react'
import StatsGrid from './StatusGrid';
import ChartSection from './ChartSection'
import TableSection from './TableSection';
import ActivityFeed from './ActivityFeed';
function Dashboard(){
    return (
        <div className='space-y-6'>
            {/* Stats Grid */}
            <StatsGrid/>

            {/* Chart Sections */}
            <ChartSection/>

            {/*  */}
            <div className='grid gird-cols-1 xl:grid-cols-3 gap-6'>
                <div className='xl:col-span-2'>
                    <TableSection/>
                </div>

                <div>
                    <ActivityFeed/>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;