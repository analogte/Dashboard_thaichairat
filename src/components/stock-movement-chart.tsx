"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"
import { type StockDailySummary } from "@/lib/api"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

function StockMovementChartInner({ data }: { data: StockDailySummary[] }) {
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
    return <p className="text-sm text-muted-foreground py-8 text-center">ยังไม่มีข้อมูล stock daily</p>
  }

  const chartData = useMemo(() => data.map((d) => ({
    date: d.date.slice(5),
    received: d.total_received,
    sold: d.total_sold,
  })), [data])

  return (
    <div ref={containerRef} style={{ width: "100%", height: 280, contain: "strict" }}>
      {width > 0 && (
        <AreaChart data={chartData} width={width} height={280}>
          <defs>
            <linearGradient id="receivedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="soldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
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
            formatter={(value: number) => [`${value.toLocaleString("th-TH")} กก.`, ""]}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#999" }} iconType="circle" iconSize={8} />
          <Area type="monotone" dataKey="received" stroke="#3b82f6" fill="url(#receivedGrad)" strokeWidth={2} name="รับเข้า" />
          <Area type="monotone" dataKey="sold" stroke="#f97316" fill="url(#soldGrad)" strokeWidth={2} name="ขายออก" />
        </AreaChart>
      )}
    </div>
  )
}

export default memo(StockMovementChartInner)
