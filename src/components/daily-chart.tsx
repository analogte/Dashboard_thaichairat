"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"
import { type DailyRecord } from "@/lib/api"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

function DailyChartInner({ data }: { data: DailyRecord[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0
      if (Math.abs(w - width) > 20) setWidth(w)
    })
    ro.observe(containerRef.current)
    setWidth(containerRef.current.clientWidth)
    return () => ro.disconnect()
  }, [])

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">ไม่มีข้อมูล</p>
  }

  const chartData = useMemo(() => data.map((d) => ({
    date: d.date.slice(5), // MM-DD
    income: d.income,
    expense: d.expense,
    profit: d.profit,
  })), [data])

  return (
    <div ref={containerRef} style={{ width: "100%", height: 280, contain: "strict" }}>
      {width > 0 && (
        <AreaChart data={chartData} width={width} height={280}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c1c1c",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
            }}
            cursor={false}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#999" }} iconType="circle" iconSize={8} />
          <Area type="monotone" dataKey="income" stroke="#22c55e" fill="url(#incomeGrad)" strokeWidth={2} name="รายรับ" />
          <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} name="รายจ่าย" />
        </AreaChart>
      )}
    </div>
  )
}

export default memo(DailyChartInner)
