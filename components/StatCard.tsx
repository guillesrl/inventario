interface Props {
  label: string
  value: string | number
  icon: string
  accent?: boolean
}

export default function StatCard({ label, value, icon, accent }: Props) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 ${accent ? 'border border-red-200' : ''}`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-bold ${accent ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
      </div>
    </div>
  )
}
