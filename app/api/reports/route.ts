import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const format = searchParams.get('format') ?? 'csv'
  const type = searchParams.get('type') ?? 'inventory'

  const userId = session.user.id

  if (type === 'inventory') {
    const products = await prisma.product.findMany({
      where: { userId, deletedAt: null },
      include: { category: { select: { name: true } } },
      orderBy: { name: 'asc' },
    })

    if (format === 'csv') {
      const rows = [
        'Nombre,Descripción,Precio,Stock,Categoría',
        ...products.map((p) =>
          [
            `"${p.name}"`,
            `"${p.description ?? ''}"`,
            p.price.toFixed(2),
            p.stock,
            `"${p.category?.name ?? ''}"`,
          ].join(',')
        ),
      ].join('\n')

      return new NextResponse(rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="inventario.csv"',
        },
      })
    }
  }

  if (type === 'sales') {
    const sales = await prisma.sale.findMany({
      where: { userId },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    if (format === 'csv') {
      const rows = [
        'Producto,Cantidad,Total,Fecha',
        ...sales.map((s) =>
          [
            `"${s.product.name}"`,
            s.quantity,
            s.total.toFixed(2),
            s.createdAt.toISOString().split('T')[0],
          ].join(',')
        ),
      ].join('\n')

      return new NextResponse(rows, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="ventas.csv"',
        },
      })
    }
  }

  return NextResponse.json({ error: 'Formato o tipo no soportado' }, { status: 400 })
}
