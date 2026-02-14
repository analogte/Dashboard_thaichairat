"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts"

interface MonthlyComparisonChartProps {
  data: {
    month: string
    income: number
    expense: number
    net: number
  }[]
}

export function MonthlyComparisonChart({ data }: MonthlyComparisonChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
    )
  }

  const fmt = (v: number) => `${(v / 1000).toFixed(0)}k`

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" />
        <YAxis tickFormatter={fmt} className="text-xs" />
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value.toLocaleString("th-TH")} ฿`,
            name === "income"
              ? "รายรับ"
              : name === "expense"
                ? "รายจ่าย"
                : "สุทธิ",
          ]}
        />
        <Legend
          formatter={(value) =>
            value === "income"
              ? "รายรับ"
              : value === "expense"
                ? "รายจ่าย"
                : "สุทธิ"
          }
        />
        <Bar dataKey="income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
        <Line
          type="monotone"
          dataKey="net"
          stroke="hsl(var(--chart-3))"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
