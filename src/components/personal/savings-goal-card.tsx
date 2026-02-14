"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import type { PersonalSavingsGoal } from "@/lib/personal-types"

interface SavingsGoalCardProps {
  goal: PersonalSavingsGoal
  onAddMoney: (id: number, amount: number) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function SavingsGoalCard({ goal, onAddMoney, onDelete }: SavingsGoalCardProps) {
  const [addAmount, setAddAmount] = useState("")
  const [adding, setAdding] = useState(false)

  const progress = goal.target_amount > 0
    ? Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100))
    : 0

  const remaining = Number(goal.target_amount) - Number(goal.current_amount)
  const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  async function handleAdd() {
    if (!addAmount) return
    setAdding(true)
    await onAddMoney(goal.id, parseFloat(addAmount))
    setAddAmount("")
    setAdding(false)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{goal.name}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-red-500"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {goal.deadline && (
          <p className="text-xs text-muted-foreground">
            ภายใน {new Date(goal.deadline).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>{fmt(Number(goal.current_amount))} ฿</span>
            <span className="text-muted-foreground">{fmt(Number(goal.target_amount))} ฿</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{progress}%</span>
            {remaining > 0 && <span>เหลือ {fmt(remaining)} ฿</span>}
            {remaining <= 0 && <span className="text-green-600 font-medium">สำเร็จ!</span>}
          </div>
        </div>

        {/* Add money */}
        <div className="flex gap-2">
          <Input
            type="number"
            min="0"
            step="1"
            placeholder="เพิ่มเงิน"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            className="flex-1"
          />
          <Button size="sm" disabled={!addAmount || adding} onClick={handleAdd}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
