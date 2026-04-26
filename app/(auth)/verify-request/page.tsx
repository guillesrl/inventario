export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-8 w-full max-w-sm text-center space-y-3">
        <div className="text-4xl">📧</div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Revisa tu correo</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Te enviamos un enlace de acceso. Abre el email y haz clic en el enlace para ingresar.
        </p>
      </div>
    </div>
  )
}
