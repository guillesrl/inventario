import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import CategoryForm from '@/components/CategoryForm'
import CategoryList from '@/components/CategoryList'

export default async function CategoriesPage() {
  const session = await auth()
  const userId = session!.user.id

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorías</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">Nueva categoría</h2>
        <CategoryForm />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Categorías existentes
        </h2>
        <CategoryList categories={categories} />
      </div>
    </div>
  )
}
