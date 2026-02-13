"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"
import { type DailyAttendanceTrend } from "@/lib/api"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"

function WageChartInner({ data, budget }: { data: DailyAttendanceTrend[]; budget: number }) {
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

  const dailyBudget = Math.round(budget / 30)

  const chartData = useMemo(() => data.map((d) => ({
    date: d.date.slice(5),
    wage: d.total_wage,
  })), [data])

  return (
    <div ref={containerRef} style={{ width: "100%", height: 220, contain: "strict" }}>
      {width > 0 && (
        <AreaChart data={chartData} width={width} height={220}>
          <defs>
            <linearGradient id="wageGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
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
            formatter={(value: number) => [`${value.toLocaleString("th-TH")} บาท`, "ค่าแรง"]}
          />
          <ReferenceLine
            y={dailyBudget}
            stroke="#f59e0b"
            strokeDasharray="5 5"
            label={{ value: `งบ/วัน ${dailyBudget.toLocaleString()}`, fill: "#f59e0b", fontSize: 11, position: "right" }}
          />
          <Area type="monotone" dataKey="wage" stroke="#a855f7" fill="url(#wageGrad)" strokeWidth={2} />
        </AreaChart>
      )}
    </div>
  )
}

export default memo(WageChartInner)
