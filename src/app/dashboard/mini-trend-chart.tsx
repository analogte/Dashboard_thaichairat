"use client"

import { memo, useEffect, useRef, useState, useMemo } from "react"
import { type DailyRecord } from "@/lib/api"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

function MiniTrendChartInner({ data }: { data: DailyRecord[] }) {
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

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        date: d.date.slice(5), // MM-DD
        income: d.income,
        profit: d.profit,
      })),
    [data]
  )

  if (chartData.length === 0) return null

  return (
    <div ref={containerRef} style={{ width: "100%", height: 160, contain: "strict" }}>
      {width > 0 && (
        <AreaChart data={chartData} width={width} height={160} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="miniIncomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="miniProfitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#666" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 10, fill: "#666" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c1c1c",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
              fontSize: 12,
            }}
            cursor={false}
            formatter={(value: number) => value.toLocaleString("th-TH")}
          />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#22c55e"
            fill="url(#miniIncomeGrad)"
            strokeWidth={2}
            name="รายรับ"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke="#3b82f6"
            fill="url(#miniProfitGrad)"
            strokeWidth={2}
            name="กำไร"
            dot={false}
          />
        </AreaChart>
      )}
    </div>
  )
}

export default memo(MiniTrendChartInner)
