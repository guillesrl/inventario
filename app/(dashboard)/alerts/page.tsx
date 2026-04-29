import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import AlertList from '@/components/AlertList'

export default async function AlertsPage() {
  const session = await auth()
  const userId = session!.user.id

  const alerts = await prisma.alert.findMany({
    where: { userId },
    orderBy: [{ isResolved: 'asc' }, { createdAt: 'desc' }],
    include: { product: { select: { id: true, name: true, stock: true } } },
  })

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alertas</h1>
      <AlertList alerts={alerts} />
    </div>
  )
}
