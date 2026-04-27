'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const messages: Record<string, string> = {
  Configuration: 'Error de configuración del servidor.',
  AccessDenied: 'No tenés permiso para acceder.',
  Verification: 'El enlace de verificación expiró o ya fue usado.',
  Default: 'Ocurrió un error al iniciar sesión.',
}

export default function AuthErrorPage() {
  const params = useSearchParams()
  const error = params.get('error') ?? 'Default'
  const message = messages[error] ?? messages.Default

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 w-full max-w-sm space-y-4 text-center">
        <h1 className="text-xl font-bold text-red-600">Error de autenticación</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
        <Link
          href="/login"
          className="inline-block mt-2 text-blue-600 hover:underline text-sm"
        >
          Volver al login
        </Link>
      </div>
    </div>
  )
}
