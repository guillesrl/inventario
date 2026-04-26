'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

export default function SaleForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selected = products.find((p) => p.id === productId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: Number(quantity) }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Error al registrar venta')
    } else {
      setSuccess(`Venta registrada: $${data.total.toFixed(2)}`)
      setProductId('')
      setQuantity('1')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Producto</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona un producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — ${p.price.toFixed(2)} (stock: {p.stock})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Cantidad</label>
        <input
          type="number"
          min="1"
          max={selected?.stock ?? undefined}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {selected && (
        <p className="text-sm text-gray-500">
          Total estimado: <strong>${(selected.price * Number(quantity)).toFixed(2)}</strong>
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !productId}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? 'Registrando...' : 'Registrar venta'}
      </button>
    </form>
  )
}
