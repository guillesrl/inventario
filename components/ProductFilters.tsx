'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface Category {
  id: string
  name: string
}

export default function ProductFilters({ categories }: { categories: Category[] }) {
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
    <div className="flex gap-2 flex-wrap">
      <input
        type="text"
        placeholder="Buscar producto..."
        defaultValue={searchParams.get('q') ?? ''}
        onBlur={(e) => updateParams({ q: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') updateParams({ q: (e.target as HTMLInputElement).value })
        }}
        className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
      />
      <select
        defaultValue={searchParams.get('category') ?? ''}
        onChange={(e) => updateParams({ category: e.target.value })}
        className="border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todas las categorías</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  )
}
