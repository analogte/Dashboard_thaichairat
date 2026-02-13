"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"
import { type MarketPriceHistoryDate } from "@/lib/api"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

interface Props {
  history: MarketPriceHistoryDate[]
  selectedProduct: string | null
}

function MarketPriceChartInner({ history, selectedProduct }: Props) {
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

  const chartData = useMemo(() => {
    if (!selectedProduct) return []
    return history.map((h) => {
      const item = h.items.find((i) => i.name === selectedProduct)
      return {
        date: h.date.slice(5),
        min: item?.min ?? null,
        max: item?.max ?? null,
      }
    }).filter((d) => d.min !== null)
  }, [history, selectedProduct])

  if (!selectedProduct) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        เลือกสินค้าจากตารางด้านล่างเพื่อดูกราฟแนวโน้ม
      </p>
    )
  }

  if (chartData.length <= 1) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        ข้อมูลยังมีน้อย — กราฟจะชัดขึ้นเมื่อมีข้อมูลมากขึ้น
      </p>
    )
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: 280, contain: "strict" }}>
      {width > 0 && (
        <AreaChart data={chartData} width={width} height={280}>
          <defs>
            <linearGradient id="minMaxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#999" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#999" }}
            axisLine={false}
            tickLine={false}
          />
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
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#999" }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="max"
            stroke="#22c55e"
            fill="url(#minMaxGrad)"
            strokeWidth={2}
            name="ราคาสูงสุด"
          />
          <Area
            type="monotone"
            dataKey="min"
            stroke="#86efac"
            fill="none"
            strokeWidth={2}
            strokeDasharray="5 3"
            name="ราคาต่ำสุด"
          />
        </AreaChart>
      )}
    </div>
  )
}

export default memo(MarketPriceChartInner)
