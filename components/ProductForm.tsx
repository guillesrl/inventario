'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: string
  name: string
}

interface Props {
  categories: Category[]
  product?: {
    id: string
    name: string
    description?: string | null
    price: number
    stock: number
    categoryId?: string | null
  }
}

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price?.toString() ?? '',
    stock: product?.stock?.toString() ?? '',
    categoryId: product?.categoryId ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const url = isEdit ? `/api/products/${product.id}` : '/api/products'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        categoryId: form.categoryId || null,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Error al guardar')
    } else {
      router.push('/products')
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este producto?')) return
    await fetch(`/api/products/${product!.id}`, { method: 'DELETE' })
    router.push('/products')
    router.refresh()
  }

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "text-sm font-medium text-gray-700 dark:text-gray-300"

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="space-y-1">
        <label className={labelClass}>Nombre *</label>
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Descripción</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className={labelClass}>Precio *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Stock *</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelClass}>Categoría</label>
        <select
          value={form.categoryId}
          onChange={(e) => set('categoryId', e.target.value)}
          className={inputClass}
        >
          <option value="">Sin categoría</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Eliminar
          </button>
        )}
      </div>
    </form>
  )
}
