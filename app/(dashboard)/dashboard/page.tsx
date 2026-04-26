import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import StatCard from '@/components/StatCard'

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user.id

  const [totalProducts, products, totalSales, activeAlerts] = await Promise.all([
    prisma.product.count({ where: { userId, deletedAt: null } }),
    prisma.product.findMany({
      where: { userId, deletedAt: null },
      select: { price: true, stock: true },
    }),
    prisma.sale.aggregate({ where: { userId }, _sum: { total: true } }),
    prisma.alert.count({ where: { userId, isResolved: false } }),
  ])

  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const lowStockCount = products.filter((p) => p.stock <= 5).length

  const recentSales = await prisma.sale.findMany({
    where: { userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true } } },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Productos" value={totalProducts} icon="📦" />
        <StatCard label="Valor inventario" value={`$${totalInventoryValue.toFixed(2)}`} icon="💰" />
        <StatCard label="Ventas totales" value={`$${(totalSales._sum.total ?? 0).toFixed(2)}`} icon="📈" />
        <StatCard label="Alertas activas" value={activeAlerts} icon="🔔" accent={activeAlerts > 0} />
      </div>

      {lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm">
          ⚠️ {lowStockCount} producto{lowStockCount > 1 ? 's' : ''} con stock bajo (≤5 unidades)
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Últimas ventas</h2>
        {recentSales.length === 0 ? (
          <p className="text-gray-400 text-sm">Sin ventas registradas aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="pb-2">Producto</th>
                <th className="pb-2">Cantidad</th>
                <th className="pb-2">Total</th>
                <th className="pb-2">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="py-2">{sale.product.name}</td>
                  <td className="py-2">{sale.quantity}</td>
                  <td className="py-2">${sale.total.toFixed(2)}</td>
                  <td className="py-2 text-gray-400">{sale.createdAt.toLocaleDateString('es')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
