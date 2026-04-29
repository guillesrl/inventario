import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import SaleForm from '@/components/SaleForm'
import SalesFilters from '@/components/SalesFilters'
import Link from 'next/link'

const PAGE_SIZE = 20

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; from?: string; to?: string }>
}) {
  const session = await auth()
  const userId = session!.user.id
  const { page: pageParam, from = '', to = '' } = await searchParams

  const page = Math.max(1, Number(pageParam ?? 1))
  const skip = (page - 1) * PAGE_SIZE

  const dateFilter =
    from || to
      ? {
          createdAt: {
            ...(from ? { gte: new Date(from + 'T00:00:00') } : {}),
            ...(to ? { lte: new Date(to + 'T23:59:59') } : {}),
          },
        }
      : {}

  const where = { userId, ...dateFilter }

  const [sales, total, products] = await Promise.all([
    prisma.sale.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: PAGE_SIZE,
      include: { product: { select: { name: true } } },
    }),
    prisma.sale.count({ where }),
    prisma.product.findMany({
      where: { userId, deletedAt: null, stock: { gt: 0 } },
      select: { id: true, name: true, price: true, stock: true },
      orderBy: { name: 'asc' },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildUrl(params: Record<string, string | number | null | undefined>) {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== '') p.set(k, String(v))
    }
    const qs = p.toString()
    return qs ? `/sales?${qs}` : '/sales'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ventas</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">Registrar venta</h2>
        <SaleForm products={products} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Historial</h2>
          <Suspense fallback={<div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />}>
            <SalesFilters from={from} to={to} />
          </Suspense>
        </div>

        {sales.length === 0 ? (
          <p className="p-5 text-gray-400 dark:text-gray-500 text-sm">
            {from || to ? 'Sin ventas en el rango seleccionado.' : 'Sin ventas registradas aún.'}
          </p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr className="text-left text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Cantidad</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{s.product.name}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{s.quantity}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">${s.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500">{s.createdAt.toLocaleDateString('es')}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {total} venta{total !== 1 ? 's' : ''} · Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Link
                  href={buildUrl({ page: page - 1, from, to })}
                  aria-disabled={page <= 1}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    page <= 1
                      ? 'pointer-events-none opacity-30 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  ← Anterior
                </Link>
                <Link
                  href={buildUrl({ page: page + 1, from, to })}
                  aria-disabled={page >= totalPages}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    page >= totalPages
                      ? 'pointer-events-none opacity-30 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  Siguiente →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
