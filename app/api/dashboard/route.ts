import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id

  const [totalProducts, products, sales, activeAlerts] = await Promise.all([
    prisma.product.count({ where: { userId, deletedAt: null } }),
    prisma.product.findMany({
      where: { userId, deletedAt: null },
      select: { price: true, stock: true },
    }),
    prisma.sale.findMany({
      where: { userId },
      select: { total: true, quantity: true, createdAt: true, product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.alert.count({ where: { userId, isResolved: false } }),
  ])

  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0)
  const lowStockCount = products.filter((p) => p.stock <= 5).length
  const totalSalesValue = sales.reduce((sum, s) => sum + s.total, 0)

  return NextResponse.json({
    totalProducts,
    totalInventoryValue,
    lowStockCount,
    activeAlerts,
    totalSalesValue,
    recentSales: sales.slice(0, 10),
  })
}
