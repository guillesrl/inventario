'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Alert {
  id: string
  message: string
  threshold: number
  isResolved: boolean
  createdAt: Date
  product: { id: string; name: string; stock: number }
}

export default function AlertList({ alerts }: { alerts: Alert[] }) {
  const router = useRouter()
  const [resolving, setResolving] = useState<string | null>(null)

  async function handleResolve(id: string) {
    setResolving(id)
    await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isResolved: true }),
    })
    setResolving(null)
    router.refresh()
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-400 dark:text-gray-500 text-sm">
        No hay alertas registradas.
      </div>
    )
  }

  const active = alerts.filter((a) => !a.isResolved)
  const resolved = alerts.filter((a) => a.isResolved)

  return (
    <div className="space-y-4">
      {active.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Activas</span>
            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium px-2 py-0.5 rounded-full">
              {active.length}
            </span>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {active.map((a) => (
              <li key={a.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.product.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{a.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Stock actual: <span className="font-medium text-red-600 dark:text-red-400">{a.product.stock}</span>
                    {' · '}Umbral: {a.threshold}
                    {' · '}{new Date(a.createdAt).toLocaleDateString('es')}
                  </p>
                </div>
                <button
                  onClick={() => handleResolve(a.id)}
                  disabled={resolving === a.id}
                  className="shrink-0 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {resolving === a.id ? 'Resolviendo...' : 'Marcar resuelta'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resolved.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden opacity-60">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Resueltas</span>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {resolved.map((a) => (
              <li key={a.id} className="px-5 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-through">{a.product.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {a.message} · {new Date(a.createdAt).toLocaleDateString('es')}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
