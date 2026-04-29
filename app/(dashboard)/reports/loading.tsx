export default function ReportsLoading() {
  return (
    <div className="space-y-5">
      <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 animate-pulse">
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-56 bg-gray-100 dark:bg-gray-700 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-3 animate-pulse">
            <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="flex gap-2">
              <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
