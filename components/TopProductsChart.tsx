'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface TopProduct {
  name: string
  total: number
  quantity: number
}

export default function TopProductsChart({ data }: { data: TopProduct[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-2">Top 5 productos más vendidos</h2>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Sin ventas aún.</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
      <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-4">Top 5 productos más vendidos</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.15} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={110}
          />
          <Tooltip
            contentStyle={{
              background: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#f9fafb',
            }}
            formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Total ventas']}
          />
          <Bar dataKey="total" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
