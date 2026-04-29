'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ImportResult {
  created: number
  skipped: number
  errors: string[]
}

export default function ImportProductsModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/products/import', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al importar')
    } else {
      setResult(data)
      router.refresh()
    }
    setLoading(false)
  }

  function handleClose() {
    setOpen(false)
    setResult(null)
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Importar CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md space-y-4 mx-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Importar productos (CSV)</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Encabezados requeridos:{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-gray-700 dark:text-gray-300">
                name, description, price, stock, category
              </code>
              . Los productos existentes serán actualizados.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv"
                required
                className="w-full text-sm text-gray-600 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 cursor-pointer"
              />

              {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

              {result && (
                <div className="space-y-1 text-sm">
                  <p className="text-green-600 dark:text-green-400">
                    ✓ {result.created} producto{result.created !== 1 ? 's' : ''} importados
                  </p>
                  {result.skipped > 0 && (
                    <p className="text-yellow-600 dark:text-yellow-400">
                      ⚠ {result.skipped} omitidos
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {result ? 'Cerrar' : 'Cancelar'}
                </button>
                {!result && (
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Importando...' : 'Importar'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
