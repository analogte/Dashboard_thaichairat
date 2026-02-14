"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface HealthChartProps {
  data: { date: string; value: number | null }[]
  label: string
  color: string
  unit: string
}

export function HealthChart({ data, label, color, unit }: HealthChartProps) {
  const filtered = data.filter((d) => d.value != null)

  if (filtered.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        ยังไม่มีข้อมูล{label}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={filtered} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => {
            const date = new Date(d)
            return `${date.getDate()}/${date.getMonth() + 1}`
          }}
          className="text-xs"
        />
        <YAxis className="text-xs" />
        <Tooltip
          labelFormatter={(d: string) => {
            const date = new Date(d)
            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() + 543}`
          }}
          formatter={(value: number) => [`${value} ${unit}`, label]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 3 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
