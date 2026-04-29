'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface ChildCategory {
  id: string
  name: string
  _count: { products: number }
}

interface Category {
  id: string
  name: string
  parentId: string | null
  _count: { products: number }
  children: ChildCategory[]
}

export default function CategoryList({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string, childCount?: number) {
    const msg =
      childCount && childCount > 0
        ? `¿Eliminar esta categoría? Sus ${childCount} subcategoría${childCount !== 1 ? 's' : ''} pasarán a ser categorías raíz. Los productos quedarán sin categoría.`
        : '¿Eliminar esta categoría? Los productos quedarán sin categoría.'
    if (!confirm(msg)) return
    setDeleting(id)
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setDeleting(null)
    router.refresh()
  }

  const topLevel = categories.filter((c) => c.parentId === null)

  if (topLevel.length === 0) {
    return <p className="text-gray-400 dark:text-gray-500 text-sm">No hay categorías aún.</p>
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
      {topLevel.map((c) => (
        <li key={c.id}>
          <div className="flex items-center justify-between py-3">
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</span>
              <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                {c._count.products} producto{c._count.products !== 1 ? 's' : ''}
              </span>
              {c.children.length > 0 && (
                <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">
                  {c.children.length} subcategoría{c.children.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={() => handleDelete(c.id, c.children.length)}
              disabled={deleting === c.id}
              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
            >
              {deleting === c.id ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>

          {c.children.map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between py-2 pl-5 border-t border-gray-50 dark:border-gray-750"
            >
              <div>
                <span className="text-gray-400 dark:text-gray-500 text-xs mr-1">└</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{child.name}</span>
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                  {child._count.products} producto{child._count.products !== 1 ? 's' : ''}
                </span>
              </div>
              <button
                onClick={() => handleDelete(child.id)}
                disabled={deleting === child.id}
                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting === child.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          ))}
        </li>
      ))}
    </ul>
  )
}
