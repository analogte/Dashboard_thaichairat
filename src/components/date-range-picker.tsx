"use client"

import { useState, useMemo, useCallback } from "react"
import { CalendarDays, ChevronDown } from "lucide-react"

interface DateRange {
  from: string // YYYY-MM-DD
  to: string
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const PRESETS = [
  { label: "วันนี้", days: 0 },
  { label: "7 วัน", days: 7 },
  { label: "14 วัน", days: 14 },
  { label: "30 วัน", days: 30 },
  { label: "90 วัน", days: 90 },
]

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function formatThaiDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" })
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const handlePreset = useCallback(
    (days: number) => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - days)
      onChange({ from: formatDate(from), to: formatDate(to) })
      setOpen(false)
    },
    [onChange],
  )

  const handleCustomChange = useCallback(
    (field: "from" | "to", val: string) => {
      onChange({ ...value, [field]: val })
    },
    [value, onChange],
  )

  const displayLabel = useMemo(() => {
    if (!value.from || !value.to) return "เลือกช่วงวันที่"
    if (value.from === value.to) return formatThaiDate(value.from)
    return `${formatThaiDate(value.from)} - ${formatThaiDate(value.to)}`
  }, [value])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-md border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <CalendarDays className="h-3.5 w-3.5" />
        <span>{displayLabel}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full mt-1 z-50 w-72 rounded-lg border bg-popover shadow-lg p-3 space-y-3">
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.days}
                  onClick={() => handlePreset(p.days)}
                  className="px-2.5 py-1 text-xs rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="border-t pt-3 space-y-2">
              <p className="text-xs text-muted-foreground font-medium">กำหนดเอง</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block" htmlFor="date-from">จาก</label>
                  <input
                    id="date-from"
                    type="date"
                    value={value.from}
                    onChange={(e) => handleCustomChange("from", e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block" htmlFor="date-to">ถึง</label>
                  <input
                    id="date-to"
                    type="date"
                    value={value.to}
                    onChange={(e) => handleCustomChange("to", e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-md border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-full py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              ตกลง
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Hook for using date range with data filtering
export function useDateRange() {
  const today = formatDate(new Date())
  const sevenDaysAgo = formatDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

  const [range, setRange] = useState<DateRange>({
    from: sevenDaysAgo,
    to: today,
  })

  const filterByRange = useCallback(
    <T extends { date: string }>(items: T[]): T[] => {
      return items.filter((item) => item.date >= range.from && item.date <= range.to)
    },
    [range],
  )

  return { range, setRange, filterByRange }
}
