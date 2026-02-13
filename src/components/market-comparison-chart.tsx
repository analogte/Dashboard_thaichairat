"use client"

import { memo, useEffect, useRef, useState, useMemo } from "react"
import { type MarketProduct } from "@/lib/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

interface Props {
  products: MarketProduct[]
}

function MarketComparisonChartInner({ products }: Props) {
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
    return products
      .filter((p) => p.shop_price !== null)
      .map((p) => {
        const ditAvg = (p.dit_min + p.dit_max) / 2
        const diffUnit = p.unit_note ? " *" : ""
        return {
          name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
          fullName: p.name,
          shop: p.shop_price,
          market: Math.round(ditAvg),
          diffUnit,
        }
      })
  }, [products])

  if (chartData.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        ไม่มีข้อมูลเทียบราคา
      </p>
    )
  }

  const height = Math.max(280, chartData.length * 32 + 60)

  return (
    <div ref={containerRef} style={{ width: "100%", height, contain: "strict" }}>
      {width > 0 && (
        <BarChart
          data={chartData}
          width={width}
          height={height}
          layout="vertical"
          margin={{ left: 10, right: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#999" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
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
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            formatter={(value: number, name: string) => [
              `${value} บาท`,
              name === "shop" ? "ราคาร้าน" : "ราคาตลาด (เฉลี่ย)",
            ]}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.name === label)
              return item ? item.fullName + (item.diffUnit || "") : label
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#999" }}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (value === "shop" ? "ราคาร้าน" : "ราคาตลาด")}
          />
          <Bar dataKey="shop" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
          <Bar dataKey="market" fill="#f97316" radius={[0, 4, 4, 0]} barSize={14} />
        </BarChart>
      )}
    </div>
  )
}

export default memo(MarketComparisonChartInner)
