import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { products: true } },
      children: {
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      },
    },
  })

  return NextResponse.json(categories)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, parentId } = await req.json()
  if (!name) return NextResponse.json({ error: 'name es requerido' }, { status: 400 })

  if (parentId) {
    const parent = await prisma.category.findFirst({
      where: { id: parentId, userId: session.user.id },
    })
    if (!parent) return NextResponse.json({ error: 'Categoría padre no encontrada' }, { status: 404 })
    if (parent.parentId) return NextResponse.json({ error: 'Solo se permite un nivel de subcategorías' }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { name, userId: session.user.id, parentId: parentId ?? null },
  })

  return NextResponse.json(category, { status: 201 })
}
