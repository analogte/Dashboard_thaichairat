"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c43",
  "#a4de6c",
]

interface CategoryPieChartProps {
  data: { category: string; amount: number }[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูล</p>
    )
  }

  const total = data.reduce((s, d) => s + d.amount, 0)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={100}
          dataKey="amount"
          nameKey="category"
          label={({ category, percent }) =>
            `${category} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            `${value.toLocaleString("th-TH")} ฿ (${((value / total) * 100).toFixed(1)}%)`,
            "จำนวน",
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
