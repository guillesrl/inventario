import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { categoriesCache } from '@/lib/cache'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const cacheKey = `categories:${userId}`

  // Intentar obtener del cache
  const cached = categoriesCache.get(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  const categories = await prisma.category.findMany({
    where: { userId, deletedAt: null },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: { where: { deletedAt: null } } } },
      children: {
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: { where: { deletedAt: null } } } } },
      },
    },
  })

  // Guardar en cache
  categoriesCache.set(cacheKey, categories)

  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const { name, parentId } = await req.json()
  if (!name) return NextResponse.json({ error: 'name es requerido' }, { status: 400 })

  if (parentId) {
    const parent = await prisma.category.findFirst({
      where: { id: parentId, userId, deletedAt: null },
    })
    if (!parent) return NextResponse.json({ error: 'Categoría padre no encontrada' }, { status: 404 })
    if (parent.parentId) return NextResponse.json({ error: 'Solo se permite un nivel de subcategorías' }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { name, userId, parentId: parentId ?? null },
  })

  // Invalidar cache
  categoriesCache.delete(`categories:${userId}`)

  return NextResponse.json(category, { status: 201 })
}
