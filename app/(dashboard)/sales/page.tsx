import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import SaleForm from '@/components/SaleForm'

export default async function SalesPage() {
  const session = await auth()
  const userId = session!.user.id

  const [sales, products] = await Promise.all([
    prisma.sale.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { product: { select: { name: true } } },
    }),
    prisma.product.findMany({
      where: { userId, deletedAt: null, stock: { gt: 0 } },
      select: { id: true, name: true, price: true, stock: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ventas</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">Registrar venta</h2>
        <SaleForm products={products} />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Historial</h2>
        </div>
        {sales.length === 0 ? (
          <p className="p-5 text-gray-400 dark:text-gray-500 text-sm">Sin ventas registradas aún.</p>
        ) : (
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
        )}
      </div>
    </div>
  )
}
