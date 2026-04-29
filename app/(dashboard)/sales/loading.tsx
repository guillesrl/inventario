export default function SalesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-4 animate-pulse">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-10 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 border-b border-gray-100 dark:border-gray-700 animate-pulse" />
        ))}
      </div>
    </div>
  )
}
