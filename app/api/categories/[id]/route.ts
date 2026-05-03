import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { categoriesCache } from '@/lib/cache'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = session.user.id
  const { id } = await params

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category || category.userId !== userId)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Soft delete: marcar como eliminado
  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  // Invalidar cache
  categoriesCache.delete(`categories:${userId}`)

  return NextResponse.json({ ok: true })
}
