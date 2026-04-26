import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const category = await prisma.category.findUnique({ where: { id } })
  if (!category || category.userId !== session.user.id)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.category.delete({ where: { id } })

  return NextResponse.json({ ok: true })
}
