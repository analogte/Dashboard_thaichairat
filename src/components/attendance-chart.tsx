"use client"

import { memo, useEffect, useMemo, useRef, useState } from "react"
import { type DailyAttendanceTrend } from "@/lib/api"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

function AttendanceChartInner({ data }: { data: DailyAttendanceTrend[] }) {
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
    date: d.date.slice(5),
    present: d.present,
  })), [data])

  return (
    <div ref={containerRef} style={{ width: "100%", height: 220, contain: "strict" }}>
      {width > 0 && (
        <BarChart data={chartData} width={width} height={220}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1c1c1c",
              border: "1px solid #333",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
            }}
            cursor={false}
            formatter={(value: number) => [`${value} คน`, "มาทำงาน"]}
          />
          <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      )}
    </div>
  )
}

export default memo(AttendanceChartInner)
