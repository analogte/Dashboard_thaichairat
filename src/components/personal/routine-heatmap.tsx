"use client"

import type { PersonalRoutine } from "@/lib/personal-types"

interface RoutineHeatmapProps {
  routines: PersonalRoutine[]
  templateCount: number
  weeks: number
}

export function RoutineHeatmap({
  routines,
  templateCount,
  weeks,
}: RoutineHeatmapProps) {
  // generate dates for last N weeks
  const today = new Date()
  const dates: string[] = []
  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split("T")[0])
  }

  // group routines by date
  const byDate = new Map<string, PersonalRoutine[]>()
  routines.forEach((r) => {
    const existing = byDate.get(r.date) || []
    existing.push(r)
    byDate.set(r.date, existing)
  })

  const dayLabels = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"]

  // organize into weeks (columns) and days (rows)
  const grid: string[][] = []
  for (let w = 0; w < weeks; w++) {
    const week: string[] = []
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d
      week.push(dates[idx] || "")
    }
    grid.push(week)
  }

  function getColor(date: string): string {
    if (!date) return "bg-transparent"
    const dateRoutines = byDate.get(date) || []
    if (dateRoutines.length === 0 || templateCount === 0) return "bg-muted"
    const doneCount = dateRoutines.filter((r) => r.done).length
    const ratio = doneCount / templateCount
    if (ratio >= 0.8) return "bg-green-500"
    if (ratio >= 0.4) return "bg-yellow-400"
    if (ratio > 0) return "bg-yellow-200 dark:bg-yellow-800"
    return "bg-muted"
  }

  function getTooltip(date: string): string {
    if (!date) return ""
    const dateRoutines = byDate.get(date) || []
    const doneCount = dateRoutines.filter((r) => r.done).length
    const d = new Date(date)
    const thaiDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear() + 543}`
    return `${thaiDate}: ${doneCount}/${templateCount} กิจวัตร`
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {dayLabels.map((label) => (
            <div
              key={label}
              className="w-6 h-6 text-[10px] text-muted-foreground flex items-center justify-center"
            >
              {label}
            </div>
          ))}
        </div>
        {/* Weeks */}
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date, di) => (
              <div
                key={di}
                className={`w-6 h-6 rounded-sm ${getColor(date)} transition-colors`}
                title={getTooltip(date)}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>น้อย</span>
        <div className="w-4 h-4 rounded-sm bg-muted" />
        <div className="w-4 h-4 rounded-sm bg-yellow-200 dark:bg-yellow-800" />
        <div className="w-4 h-4 rounded-sm bg-yellow-400" />
        <div className="w-4 h-4 rounded-sm bg-green-500" />
        <span>มาก</span>
      </div>
    </div>
  )
}
