"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface BudgetCardProps {
  category: string
  budget: number
  spent: number
  onBudgetChange: (amount: number) => void
}

export function BudgetCard({
  category,
  budget,
  spent,
  onBudgetChange,
}: BudgetCardProps) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(budget))

  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const remaining = budget - spent
  const colorClass =
    pct > 90 ? "text-red-500" : pct > 70 ? "text-yellow-500" : "text-green-600"
  const progressColor =
    pct > 90
      ? "[&>div]:bg-red-500"
      : pct > 70
        ? "[&>div]:bg-yellow-500"
        : "[&>div]:bg-green-500"

  const fmt = (n: number) =>
    n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  function handleSave() {
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      onBudgetChange(num)
    }
    setEditing(false)
  }

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium">{category}</span>
          {editing ? (
            <Input
              type="number"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              className="w-[100px] h-7 text-right text-sm"
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setValue(String(budget))
                setEditing(true)
              }}
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
            >
              งบ {fmt(budget)} ฿
            </button>
          )}
        </div>
        <Progress value={pct} className={`h-2 ${progressColor}`} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            ใช้ไป{" "}
            <span className={colorClass}>{fmt(spent)} ฿</span>
          </span>
          <span>
            เหลือ{" "}
            <span className={remaining >= 0 ? "text-green-600" : "text-red-500"}>
              {fmt(remaining)} ฿
            </span>
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
