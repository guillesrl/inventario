export default function ReportsPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-800">Inventario CSV</h2>
          <p className="text-sm text-gray-500">Exporta todos los productos con precio y stock.</p>
          <a
            href="/api/reports?type=inventory&format=csv"
            download
            className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Descargar CSV
          </a>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
          <h2 className="font-semibold text-gray-800">Ventas CSV</h2>
          <p className="text-sm text-gray-500">Exporta el historial completo de ventas.</p>
          <a
            href="/api/reports?type=sales&format=csv"
            download
            className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Descargar CSV
          </a>
        </div>
      </div>
    </div>
  )
}
