"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import {
  getTransactions,
  getRoutinesRange,
  getTemplates,
  getTodos,
  toThaiMonth,
  thaiMonthName,
  toThaiDate,
} from "@/lib/personal-api"
import type { PersonalTransaction, PersonalRoutine, PersonalTodo, RoutineTemplate } from "@/lib/personal-types"

interface DayInfo {
  transactions: PersonalTransaction[]
  routines: PersonalRoutine[]
  todos: PersonalTodo[]
  routineComplete: boolean
}

export default function PersonalCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayMap, setDayMap] = useState<Map<string, DayInfo>>(new Map())
  const [templates, setTemplates] = useState<RoutineTemplate[]>([])
  const [loading, setLoading] = useState(true)

  const year = currentDate.getFullYear()
  const monthIndex = currentDate.getMonth()
  const thaiMonth = toThaiMonth(currentDate)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const firstDay = new Date(year, monthIndex, 1)
      const lastDay = new Date(year, monthIndex + 1, 0)
      const startStr = firstDay.toISOString().split("T")[0]
      const endStr = lastDay.toISOString().split("T")[0]

      const [txs, routines, tmpls, todos] = await Promise.all([
        getTransactions(thaiMonth),
        getRoutinesRange(startStr, endStr),
        getTemplates(),
        getTodos(),
      ])

      setTemplates(tmpls)

      const map = new Map<string, DayInfo>()

      // init all days
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
        map.set(dateStr, { transactions: [], routines: [], todos: [], routineComplete: false })
      }

      txs.forEach((tx) => {
        const info = map.get(tx.date)
        if (info) info.transactions.push(tx)
      })

      routines.forEach((r) => {
        const info = map.get(r.date)
        if (info) info.routines.push(r)
      })

      todos.forEach((t) => {
        if (t.due_date) {
          const info = map.get(t.due_date)
          if (info) info.todos.push(t)
        }
      })

      // check routine completeness
      map.forEach((info) => {
        const doneCount = info.routines.filter((r) => r.done).length
        info.routineComplete = tmpls.length > 0 && doneCount >= tmpls.length
      })

      setDayMap(map)
    } catch (e) {
      console.error("Failed to load calendar:", e)
    } finally {
      setLoading(false)
    }
  }, [year, monthIndex, thaiMonth])

  useEffect(() => { load() }, [load])

  function prevMonth() {
    setCurrentDate(new Date(year, monthIndex - 1, 1))
    setSelectedDate(null)
  }

  function nextMonth() {
    setCurrentDate(new Date(year, monthIndex + 1, 1))
    setSelectedDate(null)
  }

  // build calendar grid
  const firstDayOfMonth = new Date(year, monthIndex, 1).getDay()
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
  const weeks: (string | null)[][] = []
  let week: (string | null)[] = Array(firstDayOfMonth).fill(null)

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    week.push(dateStr)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }

  const dayLabels = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"]
  const todayStr = new Date().toISOString().split("T")[0]
  const selectedInfo = selectedDate ? dayMap.get(selectedDate) : null
  const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <CalendarDays className="h-6 w-6" />
        <h1 className="text-2xl font-bold">ปฏิทินส่วนตัว</h1>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-lg font-medium">{thaiMonthName(thaiMonth)}</h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-7 gap-1">
                  {dayLabels.map((label) => (
                    <div key={label} className="text-center text-xs text-muted-foreground font-medium py-1">
                      {label}
                    </div>
                  ))}
                  {weeks.flat().map((dateStr, i) => {
                    if (!dateStr) return <div key={i} />
                    const info = dayMap.get(dateStr)
                    const isToday = dateStr === todayStr
                    const isSelected = dateStr === selectedDate
                    const day = parseInt(dateStr.split("-")[2])

                    const hasIncome = info?.transactions.some((t) => t.type === "income")
                    const hasExpense = info?.transactions.some((t) => t.type === "expense")
                    const hasRoutine = info?.routineComplete
                    const hasTodo = (info?.todos.length ?? 0) > 0

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`relative p-1.5 rounded-lg text-sm transition-colors ${
                          isSelected ? "bg-primary text-primary-foreground" :
                          isToday ? "bg-accent font-bold" :
                          "hover:bg-muted"
                        }`}
                      >
                        {day}
                        <div className="flex justify-center gap-0.5 mt-0.5">
                          {hasIncome && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          {hasExpense && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                          {hasRoutine && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          {hasTodo && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> รายรับ</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> รายจ่าย</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> กิจวัตรครบ</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> มี Todo</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Day Detail */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {selectedDate ? toThaiDate(selectedDate) : "เลือกวันเพื่อดูรายละเอียด"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!selectedDate || !selectedInfo ? (
                  <p className="text-sm text-muted-foreground">กดวันในปฏิทินเพื่อดู</p>
                ) : (
                  <div className="space-y-4">
                    {/* Transactions */}
                    {selectedInfo.transactions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">รายการเงิน</p>
                        {selectedInfo.transactions.map((tx) => (
                          <div key={tx.id} className="flex justify-between text-sm py-0.5">
                            <span>{tx.category} {tx.note && `(${tx.note})`}</span>
                            <span className={tx.type === "income" ? "text-green-600" : "text-red-500"}>
                              {tx.type === "income" ? "+" : "-"}{fmt(Number(tx.amount))}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Routines */}
                    {selectedInfo.routines.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          กิจวัตร ({selectedInfo.routines.filter((r) => r.done).length}/{templates.length})
                        </p>
                        {selectedInfo.routines.map((r) => (
                          <div key={r.id} className="flex items-center gap-2 text-sm py-0.5">
                            <span className={`w-2 h-2 rounded-full ${r.done ? "bg-green-500" : "bg-muted"}`} />
                            <span className={r.done ? "" : "text-muted-foreground"}>{r.activity}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Todos */}
                    {selectedInfo.todos.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">สิ่งที่ต้องทำ</p>
                        {selectedInfo.todos.map((t) => (
                          <div key={t.id} className="flex items-center gap-2 text-sm py-0.5">
                            <span className={`w-2 h-2 rounded-full ${t.done ? "bg-green-500" : "bg-yellow-500"}`} />
                            <span className={t.done ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedInfo.transactions.length === 0 &&
                     selectedInfo.routines.length === 0 &&
                     selectedInfo.todos.length === 0 && (
                      <p className="text-sm text-muted-foreground">ไม่มีข้อมูลในวันนี้</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
