import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, ShoppingCart, UserPlus, Package, CreditCard, 
  Truck, CheckCircle2, XCircle, Star, MessageSquare, Settings 
} from 'lucide-react';
import { fetchPaginatedActivities } from '../../../api/dashboardApi';

const iconMap = {
  ShoppingCart, UserPlus, Truck, CreditCard, XCircle, Star, 
  MessageSquare, Settings, Package, CheckCircle2
};

function ActivityFeed() {
  const [viewAll, setViewAll] = useState(false);
  const [page, setPage] = useState(1);
  const [inputPage, setInputPage] = useState("");
  const perPage = 6;

  const { 
    data, 
    isLoading, 
    isError, 
    isFetching 
  } = useQuery({
    queryKey: ['paginatedActivities', page],
    queryFn: () => fetchPaginatedActivities({ page, limit: perPage }),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

  const activitiesData = data?.activities || [];
  const totalPages = data?.totalPages || 1;
  const shownData = viewAll ? activitiesData : activitiesData.slice(0, 5);

  const goToPage = () => {
    const target = parseInt(inputPage, 10);
    if (!isNaN(target) && target >= 1 && target <= totalPages) {
      setPage(target);
      setInputPage("");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-6 text-center dark:text-white">
        Loading Activities...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-100 dark:bg-red-900/30 backdrop-blur-xl rounded-2xl border border-red-200/50 dark:border-red-700/50 p-6 text-center text-red-600 dark:text-red-400">
        Failed to load activities.
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Activity Feed
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Recent System Activities
          </p>
        </div>
        <button
          onClick={() => {
            setViewAll(!viewAll);
            if (viewAll) setPage(1);
          }}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          {viewAll ? "Collapse" : "View All"}
        </button>
      </div>

      <div className="p-6 space-y-4">
        {shownData.map((activity) => {
          const IconComponent = iconMap[activity.icon];
          return (
            <div
              key={activity.id}
              className="flex items-start space-x-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                {IconComponent && <IconComponent className={`w-4 h-4 ${activity.color}`} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">
                  {activity.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                  {activity.description}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {viewAll && shownData.length < perPage &&
          Array.from({ length: perPage - shownData.length }).map((_, idx) => (
            <div key={`empty-${idx}`} className="p-6">&nbsp;</div>
          ))}
      </div>

      {viewAll && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <button
              disabled={page === 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Page {page} of {totalPages}
            </span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToPage()}
              className="w-16 px-2 py-1 text-sm border rounded-md dark:bg-slate-800 dark:text-white"
              placeholder="Go"
            />
            <button
              onClick={goToPage}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityFeed;