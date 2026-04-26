import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import ProductForm from '@/components/ProductForm'

export default async function CreateProductPage() {
  const session = await auth()
  const categories = await prisma.category.findMany({
    where: { userId: session!.user.id },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  )
}
