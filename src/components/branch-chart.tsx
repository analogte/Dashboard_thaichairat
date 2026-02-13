"use client"

import { memo, useEffect, useRef, useState } from "react"
import { type BranchData } from "@/lib/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

function BranchChartInner({ branches }: { branches: BranchData[] }) {
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

  const chartData = branches.map((b) => ({
    name: b.name,
    income: b.income,
    expense: b.expense,
  }))

  if (chartData.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">ไม่มีข้อมูลสาขา</p>
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: 240, contain: "strict" }}>
      {width > 0 && (
        <BarChart data={chartData} width={width} height={240}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} />
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
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#999" }}
            iconType="circle"
            iconSize={8}
          />
          <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} name="รายรับ" />
          <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} name="รายจ่าย" />
        </BarChart>
      )}
    </div>
  )
}

export default memo(BranchChartInner)
