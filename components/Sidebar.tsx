'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/products', label: 'Productos', icon: '📦' },
  { href: '/categories', label: 'Categorías', icon: '🏷️' },
  { href: '/sales', label: 'Ventas', icon: '🛒' },
  { href: '/reports', label: 'Reportes', icon: '📄' },
]

interface Props {
  user: { name?: string | null; email?: string | null; image?: string | null }
}

export default function Sidebar({ user }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-100 dark:border-gray-700">
        <span className="font-bold text-gray-900 dark:text-white">📦 Inventario</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full text-left text-xs text-red-500 hover:text-red-700 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
