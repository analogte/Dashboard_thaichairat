"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"
import { type TopMover } from "@/lib/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

function StockProductChartInner({ data }: { data: TopMover[] }) {
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
    return <p className="text-sm text-muted-foreground py-8 text-center">ยังไม่มีข้อมูล</p>
  }

  const chartData = useMemo(() => data.slice(0, 10).map((d) => ({
    name: d.product.length > 8 ? d.product.slice(0, 8) + "…" : d.product,
    fullName: d.product,
    sold: d.total_sold,
    received: d.total_received,
  })), [data])

  const height = Math.max(280, chartData.length * 32 + 60)

  return (
    <div ref={containerRef} style={{ width: "100%", height, contain: "strict" }}>
      {width > 0 && (
        <BarChart data={chartData} width={width} height={height} layout="vertical" margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} width={80} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c1c1c",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
            }}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString("th-TH")} กก.`,
              name === "sold" ? "ขาย" : "รับเข้า",
            ]}
            labelFormatter={(label) => {
              return label
            }}
          />
          <Bar dataKey="sold" fill="#f97316" radius={[0, 4, 4, 0]} name="sold" />
          <Bar dataKey="received" fill="#3b82f6" radius={[0, 4, 4, 0]} name="received" />
        </BarChart>
      )}
    </div>
  )
}

export default memo(StockProductChartInner)
