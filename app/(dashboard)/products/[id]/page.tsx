import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import ProductForm from '@/components/ProductForm'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const { id } = await params

  const [product, categories] = await Promise.all([
    prisma.product.findFirst({
      where: { id, userId: session!.user.id, deletedAt: null },
    }),
    prisma.category.findMany({
      where: { userId: session!.user.id },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!product) notFound()

  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
