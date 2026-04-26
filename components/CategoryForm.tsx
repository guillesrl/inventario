'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CategoryForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al crear categoría')
    } else {
      setName('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-start">
      <div className="flex-1 space-y-1">
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de categoría"
          required
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {loading ? 'Creando...' : '+ Crear'}
      </button>
    </form>
  )
}
