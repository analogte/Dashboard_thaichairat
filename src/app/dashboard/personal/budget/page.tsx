"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MonthSelector } from "@/components/personal/month-selector"
import { BudgetCard } from "@/components/personal/budget-card"
import {
  getTransactions,
  getBudgets,
  upsertBudget,
  toThaiMonth,
} from "@/lib/personal-api"
import { EXPENSE_CATEGORIES } from "@/lib/personal-types"
import type { PersonalTransaction, PersonalBudget } from "@/lib/personal-types"

export default function BudgetPage() {
  const [month, setMonth] = useState(() => toThaiMonth(new Date()))
  const [budgets, setBudgets] = useState<PersonalBudget[]>([])
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [b, t] = await Promise.all([
        getBudgets(month),
        getTransactions(month),
      ])
      setBudgets(b)
      setTransactions(t)
    } catch (e) {
      console.error("Failed to load budget data:", e)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    load()
  }, [load])

  // calc spent per category
  const spentByCategory: Record<string, number> = {}
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      spentByCategory[t.category] =
        (spentByCategory[t.category] || 0) + Number(t.amount)
    })

  // budget map
  const budgetMap: Record<string, number> = {}
  budgets.forEach((b) => {
    budgetMap[b.category] = Number(b.budget_amount)
  })

  const totalBudget = Object.values(budgetMap).reduce((s, v) => s + v, 0)
  const totalSpent = Object.values(spentByCategory).reduce((s, v) => s + v, 0)
  const totalPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0
  const totalColor =
    totalPct > 90
      ? "[&>div]:bg-red-500"
      : totalPct > 70
        ? "[&>div]:bg-yellow-500"
        : "[&>div]:bg-green-500"

  const fmt = (n: number) =>
    n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  async function handleBudgetChange(category: string, amount: number) {
    await upsertBudget(month, category, amount)
    load()
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">งบเดือน</h1>
        <MonthSelector value={month} onChange={setMonth} />
      </div>

      {/* Total Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            งบรวม vs ใช้จริง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-lg font-bold">
            <span>ใช้ไป {fmt(totalSpent)} ฿</span>
            <span>จากงบ {fmt(totalBudget)} ฿</span>
          </div>
          <Progress value={totalPct} className={`h-3 ${totalColor}`} />
          <p className="text-sm text-muted-foreground text-right">
            เหลือ{" "}
            <span
              className={
                totalBudget - totalSpent >= 0
                  ? "text-green-600 font-medium"
                  : "text-red-500 font-medium"
              }
            >
              {fmt(totalBudget - totalSpent)} ฿
            </span>{" "}
            ({totalPct.toFixed(0)}%)
          </p>
        </CardContent>
      </Card>

      {/* Budget Cards Grid */}
      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXPENSE_CATEGORIES.map((cat) => (
            <BudgetCard
              key={cat}
              category={cat}
              budget={budgetMap[cat] || 0}
              spent={spentByCategory[cat] || 0}
              onBudgetChange={(amount) => handleBudgetChange(cat, amount)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
