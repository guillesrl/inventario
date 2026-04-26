'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Category {
  id: string
  name: string
  _count: { products: number }
}

export default function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta categoría? Los productos quedarán sin categoría.')) return
    setDeleting(id)
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setDeleting(null)
    router.refresh()
  }

  if (categories.length === 0) {
    return <p className="text-gray-400 dark:text-gray-500 text-sm">No hay categorías aún.</p>
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
      {categories.map((c) => (
        <li key={c.id} className="flex items-center justify-between py-3">
          <div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</span>
            <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">{c._count.products} producto{c._count.products !== 1 ? 's' : ''}</span>
          </div>
          <button
            onClick={() => handleDelete(c.id)}
            disabled={deleting === c.id}
            className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
          >
            {deleting === c.id ? 'Eliminando...' : 'Eliminar'}
          </button>
        </li>
      ))}
    </ul>
  )
}
