import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100)
  const q = searchParams.get('q') ?? undefined

  let products = []

  // Full-text search si hay término de búsqueda
  if (q && q.trim()) {
    const searchTerm = q.trim().replace(/\s+/g, ' ')
    const searchResults = await prisma.$queryRaw<{ id: string }[]>`
      SELECT DISTINCT p.id
      FROM products p
      WHERE p.user_id = ${session.user.id}
        AND p.deleted_at IS NULL
        AND (
          p.name ILIKE ${`%${searchTerm}%`}
          OR p.description ILIKE ${`%${searchTerm}%`}
        )
      ORDER BY p.created_at DESC
      LIMIT ${limit + 1}
    `

    const ids = searchResults.map(r => r.id)
    if (ids.length > 0) {
      products = await prisma.product.findMany({
        where: { id: { in: ids } },
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      })
    }
  } else {
    products = await prisma.product.findMany({
      where: { userId: session.user.id, deletedAt: null },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { id: true, name: true } } },
    })
  }

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
