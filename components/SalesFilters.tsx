'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface Props {
  from: string
  to: string
}

export default function SalesFilters({ from, to }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-sm text-gray-600 dark:text-gray-300">Filtrar por fecha:</span>
      <div className="flex items-center gap-2">
        <input
          type="date"
          defaultValue={from}
          onChange={(e) => updateParams({ from: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-gray-400 dark:text-gray-500 text-sm">—</span>
        <input
          type="date"
          defaultValue={to}
          onChange={(e) => updateParams({ to: e.target.value })}
          className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {(from || to) && (
        <button
          onClick={() => updateParams({ from: null, to: null })}
          className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          Limpiar
        </button>
      )}
    </div>
  )
}
