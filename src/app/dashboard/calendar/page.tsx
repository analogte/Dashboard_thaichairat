"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitor } from "@/lib/monitor-context"
import {
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

function fmtB(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

const THAI_MONTHS = ["", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"]
const DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]

export default function CalendarPage() {
  const { data, loading, refresh: load } = useMonitor()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1) // 1-based
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์</p>
        <button onClick={load} className="text-sm underline">ลองใหม่</button>
      </div>
    )
  }

  const daily = data.shop_history?.daily ?? []

  // Build map: date string -> record
  const dayMap = useMemo(() => new Map(daily.map((d) => [d.date, d])), [daily])

  // Calendar math
  const weeks = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const startDow = firstDay.getDay()
    const dim = new Date(year, month, 0).getDate()
    const result: (number | null)[][] = []
    let w: (number | null)[] = Array(startDow).fill(null)
    for (let d = 1; d <= dim; d++) {
      w.push(d)
      if (w.length === 7) { result.push(w); w = [] }
    }
    if (w.length > 0) {
      while (w.length < 7) w.push(null)
      result.push(w)
    }
    return result
  }, [year, month])

  const dateStr = useCallback((d: number) =>
    `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    [year, month]
  )

  const prevMonth = useCallback(() => {
    if (month === 1) { setYear(year - 1); setMonth(12) }
    else setMonth(month - 1)
    setSelectedDate(null)
  }, [month, year])

  const nextMonth = useCallback(() => {
    if (month === 12) { setYear(year + 1); setMonth(1) }
    else setMonth(month + 1)
    setSelectedDate(null)
  }, [month, year])

  // Monthly summary for current view
  const { monthDays, monthIncome, monthExpense, monthProfit } = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, "0")}`
    const days = daily.filter((d) => d.date.startsWith(prefix))
    let income = 0, expense = 0, profit = 0
    for (const d of days) {
      income += d.income
      expense += d.expense
      profit += d.profit
    }
    return { monthDays: days, monthIncome: income, monthExpense: expense, monthProfit: profit }
  }, [daily, year, month])

  const selected = selectedDate ? dayMap.get(selectedDate) : null

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">ปฏิทินร้าน</h1>
            <p className="text-sm text-muted-foreground">{data.updated_label}</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          รีเฟรช
        </button>
      </div>

      {/* Monthly KPI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">วันที่มีข้อมูล</p>
            <span className="text-2xl font-bold">{monthDays.length}</span>
            <span className="text-sm text-muted-foreground ml-1">วัน</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">รายรับเดือนนี้</p>
            <span className="text-2xl font-bold text-green-600">{fmtB(monthIncome)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">รายจ่ายเดือนนี้</p>
            <span className="text-2xl font-bold text-red-500">{fmtB(monthExpense)}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-1">กำไรเดือนนี้</p>
            <span className={`text-2xl font-bold ${monthProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
              {fmtB(monthProfit)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="p-1 rounded hover:bg-muted">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <CardTitle className="text-lg">{THAI_MONTHS[month]} {year + 543}</CardTitle>
            <button onClick={nextMonth} className="p-1 rounded hover:bg-muted">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                {d}
              </div>
            ))}

            {/* Calendar days */}
            {weeks.map((w, wi) =>
              w.map((d, di) => {
                if (d === null) {
                  return <div key={`${wi}-${di}`} className="h-16 md:h-20" />
                }

                const ds = dateStr(d)
                const rec = dayMap.get(ds)
                const isToday = ds === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
                const isSelected = ds === selectedDate

                let bgColor = "bg-muted/30"
                if (rec) {
                  if (rec.profit > 0) bgColor = "bg-green-500/15 hover:bg-green-500/25"
                  else if (rec.profit < 0) bgColor = "bg-red-500/15 hover:bg-red-500/25"
                  else bgColor = "bg-amber-500/15 hover:bg-amber-500/25"
                } else {
                  bgColor = "bg-muted/30 hover:bg-muted/50"
                }

                return (
                  <button
                    key={ds}
                    onClick={() => setSelectedDate(isSelected ? null : ds)}
                    className={`h-16 md:h-20 rounded-md p-1 text-left transition-colors ${bgColor} ${isSelected ? "ring-2 ring-primary" : ""} ${isToday ? "ring-1 ring-blue-400" : ""}`}
                  >
                    <span className={`text-xs ${isToday ? "font-bold text-blue-500" : "text-muted-foreground"}`}>
                      {d}
                    </span>
                    {rec && (
                      <div className="mt-0.5">
                        <span className={`text-[10px] font-mono block ${rec.profit >= 0 ? "text-green-600" : "text-red-500"}`}>
                          {rec.profit >= 0 ? "+" : ""}{fmtB(rec.profit)}
                        </span>
                      </div>
                    )}
                  </button>
                )
              }),
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground justify-center">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20" /> กำไร</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/20" /> ขาดทุน</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted/50" /> ไม่มีข้อมูล</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-1 ring-blue-400" /> วันนี้</span>
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              รายละเอียด {selectedDate}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">รายรับ</p>
                <span className="text-xl font-bold text-green-600">{fmtB(selected.income)}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">รายจ่าย</p>
                <span className="text-xl font-bold text-red-500">{fmtB(selected.expense)}</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">กำไร</p>
                <span className={`text-xl font-bold flex items-center gap-1 ${selected.profit >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {selected.profit >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {fmtB(selected.profit)}
                </span>
              </div>
            </div>

            {/* Branch breakdown */}
            {selected.branches && selected.branches.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">รายสาขา</p>
                <div className="space-y-2">
                  {selected.branches.map((b) => (
                    <div key={b.branch} className="flex items-center justify-between text-sm">
                      <span>{b.branch}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-green-600 font-mono">{fmtB(b.income)}</span>
                        <span className="text-red-500 font-mono">{fmtB(b.expense)}</span>
                        <Badge variant={b.profit >= 0 ? "default" : "destructive"} className="text-xs font-mono">
                          {b.profit >= 0 ? "+" : ""}{fmtB(b.profit)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
