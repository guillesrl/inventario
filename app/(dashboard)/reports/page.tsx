import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import TopProductsChart from '@/components/TopProductsChart'

export default async function ReportsPage() {
  const session = await auth()
  const userId = session!.user.id

  const topRaw = await prisma.sale.groupBy({
    by: ['productId'],
    where: { userId },
    _sum: { quantity: true, total: true },
    orderBy: { _sum: { total: 'desc' } },
    take: 5,
  })

  const productIds = topRaw.map((r) => r.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  })
  const nameMap = new Map(products.map((p) => [p.id, p.name]))

  const topProducts = topRaw.map((r) => ({
    name: nameMap.get(r.productId) ?? r.productId,
    total: r._sum.total ?? 0,
    quantity: r._sum.quantity ?? 0,
  }))

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reportes</h1>

      <TopProductsChart data={topProducts} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Inventario</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Exporta todos los productos con precio, stock y categoría.
          </p>
          <div className="flex gap-2">
            <a
              href="/api/reports?type=inventory&format=csv"
              download
              className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              CSV
            </a>
            <a
              href="/api/reports?type=inventory&format=pdf"
              download
              className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              PDF
            </a>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Ventas</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Exporta el historial completo de ventas.
          </p>
          <div className="flex gap-2">
            <a
              href="/api/reports?type=sales&format=csv"
              download
              className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              CSV
            </a>
            <a
              href="/api/reports?type=sales&format=pdf"
              download
              className="inline-block bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
