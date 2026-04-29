export default function AlertsLoading() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden animate-pulse">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-700">
            <div className="space-y-2 flex-1">
              <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg ml-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
