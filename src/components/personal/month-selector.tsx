"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { thaiMonthName } from "@/lib/personal-api"

function generateMonths(count: number): string[] {
  const months: string[] = []
  const now = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const thaiYear = d.getFullYear() + 543
    const m = String(d.getMonth() + 1).padStart(2, "0")
    months.push(`${thaiYear}-${m}`)
  }
  return months
}

export function MonthSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (month: string) => void
}) {
  const months = generateMonths(12)

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {months.map((m) => (
          <SelectItem key={m} value={m}>
            {thaiMonthName(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
