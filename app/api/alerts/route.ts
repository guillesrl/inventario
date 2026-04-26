import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100)

  const alerts = await prisma.alert.findMany({
    where: { userId: session.user.id },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { id: true, name: true, stock: true } } },
  })

  const hasMore = alerts.length > limit
  const data = hasMore ? alerts.slice(0, -1) : alerts

  return NextResponse.json({ data, nextCursor: hasMore ? data.at(-1)!.id : null })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, threshold } = await req.json()
  if (!productId || threshold == null) {
    return NextResponse.json({ error: 'productId y threshold son requeridos' }, { status: 400 })
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, userId: session.user.id, deletedAt: null },
  })
  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

  const alert = await prisma.alert.create({
    data: {
      productId,
      userId: session.user.id,
      threshold: Number(threshold),
      message: `Alerta: stock por debajo de ${threshold} unidades`,
    },
  })

  return NextResponse.json(alert, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, isResolved } = await req.json()
  const alert = await prisma.alert.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!alert) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.alert.update({
    where: { id },
    data: { isResolved },
  })

  return NextResponse.json(updated)
}
