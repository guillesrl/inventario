import Link from 'next/link'
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import ProductFilters from '@/components/ProductFilters'
import ImportProductsModal from '@/components/ImportProductsModal'
import { Prisma } from '@prisma/client'

const PAGE_SIZE = 20

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; category?: string }>
}) {
  const session = await auth()
  const userId = session!.user.id
  const { page: pageParam, q, category } = await searchParams

  const page = Math.max(1, Number(pageParam ?? 1))
  const skip = (page - 1) * PAGE_SIZE

  let where: Prisma.ProductFindManyArgs['where']
  let products: any[]
  let total: number

  // Usar full-text search si hay un término de búsqueda
  if (q && q.trim()) {
    const searchTerm = q.trim().replace(/\s+/g, ' ')
    const baseWhere = {
      userId,
      deletedAt: null as null,
      ...(category ? { categoryId: category } : {}),
    }

    // Full-text search en name y description
    const searchResults = await prisma.$queryRaw<{ id: string }[]>`
      SELECT DISTINCT p.id
      FROM products p
      WHERE p.user_id = ${userId}
        AND p.deleted_at IS NULL
        ${category ? Prisma.sql`AND p.category_id = ${category}` : Prisma.empty}
        AND (
          p.name ILIKE ${`%${searchTerm}%`}
          OR p.description ILIKE ${`%${searchTerm}%`}
        )
      ORDER BY p.created_at DESC
      LIMIT ${PAGE_SIZE + 1}
      OFFSET ${skip}
    `

    const ids = searchResults.map(r => r.id)

    const totalResult = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT p.id) as count
      FROM products p
      WHERE p.user_id = ${userId}
        AND p.deleted_at IS NULL
        ${category ? Prisma.sql`AND p.category_id = ${category}` : Prisma.empty}
        AND (
          p.name ILIKE ${`%${searchTerm}%`}
          OR p.description ILIKE ${`%${searchTerm}%`}
        )
    `

    total = Number(totalResult[0]?.count ?? 0)

    products = ids.length > 0 ? await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }) : []
  } else {
    where = {
      userId,
      deletedAt: null as null,
      ...(category ? { categoryId: category } : {}),
    }

    const [productList, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: PAGE_SIZE,
      }),
      prisma.product.count({ where }),
    ])

    products = productList
    total = totalCount
  }

  const categories = await prisma.category.findMany({
    where: { userId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  function buildUrl(params: Record<string, string | number | null | undefined>) {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== '') p.set(k, String(v))
    }
    const qs = p.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productos</h1>
        <div className="flex items-center gap-2">
          <ImportProductsModal />
          <Link
            href="/products/create"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Agregar producto
          </Link>
        </div>
      </div>

      <Suspense fallback={<div className="h-9 w-80 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />}>
        <ProductFilters categories={categories} />
      </Suspense>

      {products.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-10 text-center text-gray-400 dark:text-gray-500">
          {q || category ? (
            'Sin resultados para los filtros aplicados.'
          ) : (
            <>No hay productos. <Link href="/products/create" className="text-blue-600 hover:underline">Agrega el primero</Link>.</>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr className="text-left text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-900 dark:text-gray-100">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${p.stock <= 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/products/${p.id}`} className="text-blue-600 hover:underline text-xs">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {total} producto{total !== 1 ? 's' : ''} · Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Link
                href={buildUrl({ page: page - 1, q, category })}
                aria-disabled={page <= 1}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  page <= 1
                    ? 'pointer-events-none opacity-30 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                ← Anterior
              </Link>
              <Link
                href={buildUrl({ page: page + 1, q, category })}
                aria-disabled={page >= totalPages}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  page >= totalPages
                    ? 'pointer-events-none opacity-30 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                Siguiente →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
