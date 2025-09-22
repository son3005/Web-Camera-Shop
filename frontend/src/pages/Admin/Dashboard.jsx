    import React from 'react'
    import StatsGrid from '../../components/common/Dashboard/StatusGrid';
    import ChartSection from '../../components/common/Dashboard/ChartSection'
    import TableSection from '../../components/common/Dashboard/TableSection';
    import ActivityFeed from '../../components/common/Dashboard/ActivityFeed';



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