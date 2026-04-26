'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

export default function SaleForm({ products }: { products: Product[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : products

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function selectProduct(p: Product) {
    setSelected(p)
    setQuery(p.name)
    setOpen(false)
    setQuantity('1')
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value)
    setSelected(null)
    setOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    setError('')
    setSuccess('')

    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selected.id, quantity: Number(quantity) }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Error al registrar venta')
    } else {
      setSuccess(`Venta registrada: $${data.total.toFixed(2)}`)
      setSelected(null)
      setQuery('')
      setQuantity('1')
      router.refresh()
    }
    setLoading(false)
  }

  const inputClass = "w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Producto</label>
        <div ref={containerRef} className="relative">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setOpen(true)}
            placeholder="Buscar producto..."
            autoComplete="off"
            className={inputClass}
          />
          {open && filtered.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-56 overflow-y-auto">
              {filtered.map((p) => (
                <li
                  key={p.id}
                  onMouseDown={() => selectProduct(p)}
                  className="flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                >
                  <span>{p.name}</span>
                  <span className="text-gray-400 dark:text-gray-400 text-xs ml-2">
                    ${p.price.toFixed(2)} · stock {p.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {open && query.trim() && filtered.length === 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg px-3 py-2 text-sm text-gray-400 dark:text-gray-400">
              Sin resultados
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cantidad</label>
        <input
          type="number"
          min="1"
          max={selected?.stock ?? undefined}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {selected && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total estimado: <strong className="text-gray-900 dark:text-white">${(selected.price * Number(quantity)).toFixed(2)}</strong>
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !selected}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? 'Registrando...' : 'Registrar venta'}
      </button>
    </form>
  )
}
