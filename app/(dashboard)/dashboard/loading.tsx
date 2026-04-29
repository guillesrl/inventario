export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 animate-pulse">
        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-56 bg-gray-100 dark:bg-gray-700 rounded" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 animate-pulse space-y-3">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  )
}
