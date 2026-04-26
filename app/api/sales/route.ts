import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100)

  const sales = await prisma.sale.findMany({
    where: { userId: session.user.id },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { id: true, name: true } } },
  })

  const hasMore = sales.length > limit
  const data = hasMore ? sales.slice(0, -1) : sales

  return NextResponse.json({ data, nextCursor: hasMore ? data.at(-1)!.id : null })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, quantity } = await req.json()
  if (!productId || !quantity || quantity < 1) {
    return NextResponse.json({ error: 'productId y quantity son requeridos' }, { status: 400 })
  }

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, userId: session.user.id, deletedAt: null },
      })

      if (!product) throw new Error('Producto no encontrado')
      if (product.stock < quantity) throw new Error('Stock insuficiente')

      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      })

      const newSale = await tx.sale.create({
        data: {
          productId,
          userId: session.user.id,
          quantity,
          total: product.price * quantity,
        },
      })

      // Verificar alertas en el mismo request
      const alert = await tx.alert.findFirst({
        where: { productId, userId: session.user.id, isResolved: false },
      })
      if (alert && updatedProduct.stock <= alert.threshold) {
        await tx.alert.update({
          where: { id: alert.id },
          data: { message: `Stock bajo: ${updatedProduct.stock} unidades restantes` },
        })
      }

      return newSale
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al registrar venta'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
