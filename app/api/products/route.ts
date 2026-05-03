import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100)

  const products = await prisma.product.findMany({
    where: { userId: session.user.id, deletedAt: null },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { category: { select: { id: true, name: true } } },
  })

  const hasMore = products.length > limit
  const data = hasMore ? products.slice(0, -1) : products

  return NextResponse.json({ data, nextCursor: hasMore ? data.at(-1)!.id : null })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, description, price, stock, imageUrl, categoryId } = body

  if (!name || price == null || stock == null) {
    return NextResponse.json({ error: 'name, price y stock son requeridos' }, { status: 400 })
  }

  const numPrice = Number(price)
  const numStock = Number(stock)

  if (numPrice <= 0) {
    return NextResponse.json({ error: 'El precio debe ser mayor a 0' }, { status: 400 })
  }

  if (numStock < 0) {
    return NextResponse.json({ error: 'El stock no puede ser negativo' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: numPrice,
      stock: numStock,
      imageUrl,
      userId: session.user.id,
      categoryId: categoryId ?? null,
    },
  })

  return NextResponse.json(product, { status: 201 })
}
