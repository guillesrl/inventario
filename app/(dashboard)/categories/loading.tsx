export default function CategoriesLoading() {
  return (
    <div className="space-y-6 max-w-lg">
      <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-4 animate-pulse">
        <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-2">
          <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-1 animate-pulse">
        <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
