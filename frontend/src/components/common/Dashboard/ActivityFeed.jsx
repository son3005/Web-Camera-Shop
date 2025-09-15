import React from 'react';
import { Clock,ShoppingCart, UserPlus, Package, CreditCard, Truck, CheckCircle2, XCircle, Star, MessageSquare, Settings } from 'lucide-react';


const activities = [
  {
    id: 1,
    type: "order",
    icon: ShoppingCart,
    title: "New Order",
    description: "Nguyen Van A placed a new order (#1001).",
    time: "2 minutes ago",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/40",
  },
  {
    id: 2,
    type: "user",
    icon: UserPlus,
    title: "New Customer",
    description: "Tran Thi B just signed up.",
    time: "5 minutes ago",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    id: 3,
    type: "shipping",
    icon: Truck,
    title: "Order Shipped",
    description: "Order #1002 has been shipped.",
    time: "10 minutes ago",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/40",
  },
  {
    id: 4,
    type: "payment",
    icon: CreditCard,
    title: "Payment Received",
    description: "You received $250 from Le Van C.",
    time: "20 minutes ago",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    id: 5,
    type: "cancel",
    icon: XCircle,
    title: "Order Cancelled",
    description: "Pham Thi D cancelled order #1003.",
    time: "30 minutes ago",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/40",
  },
  {
    id: 6,
    type: "review",
    icon: Star,
    title: "New Review",
    description: "Hoang Van E rated a product 5 stars.",
    time: "1 hour ago",
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
  },
  {
    id: 7,
    type: "message",
    icon: MessageSquare,
    title: "New Message",
    description: "You have a new support request from Do Thi F.",
    time: "2 hours ago",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/40",
  },
  {
    id: 8,
    type: "update",
    icon: Settings,
    title: "System Update",
    description: "Your system was updated successfully.",
    time: "3 hours ago",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800/40",
  },
  {
    id: 9,
    type: "package",
    icon: Package,
    title: "Package Delivered",
    description: "Order #1004 has been delivered.",
    time: "5 hours ago",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/40",
  },
  {
    id: 10,
    type: "success",
    icon: CheckCircle2,
    title: "Task Completed",
    description: "Your daily sales report has been generated.",
    time: "1 day ago",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/40",
  },
];



function ActivityFeed(){
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl
        border border-slate-200/50 dark: border-slate-700/50">
            <div className='p-6 border-b border-slate-200/50 dark:border-slate-700/50'>
            <div>
                <h3 className='text-lg font-bold text-slate-800 dark:border-slate-700/50'>
                Activity Feed
                </h3>
                <p className='text-sm text-slate-500 dark:text-slate-400'>
                    Recent System Activites
                </p>
            </div>
            <button className='text-blue-500 hover:text-blue-700 font-medium'>
                View All
            </button>
            </div>
            <div className='p-6'>
                <div className='space-y-4'>
                    {activities.map((activity)=>{
                        return(
                            <div className='flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50
                            dark:hover:bg-slate-800/50 transition-colors'>
                                <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                                    <activity.icon className={`w-4 h-4 ${activity.color}`}/>
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <h4 className='text-sm font-semibold text-slate-800 dark:text-white'>
                                        {activity.title}
                                    </h4>
                                    <p className='text-sm text-slate-600 dark:text-slate-400 truncate'>
                                        {activity.description}
                                    </p>
                                    <div className='flex items-center-safe space-x-1 mt-1'>
                                        <Clock className='w-3 h-3 text-slate-400'/>
                                        <span className='text-xs text-slate-500 dark:text-slate-400'>
                                            {activity.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default ActivityFeed;