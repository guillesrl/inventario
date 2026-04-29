export default function ProductsLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-9 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
        <div className="h-9 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 h-10 animate-pulse" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 border-b border-gray-100 dark:border-gray-700 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
