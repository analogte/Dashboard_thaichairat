"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MonthSelector } from "@/components/personal/month-selector"
import { PrintReport } from "@/components/personal/print-report"
import {
  getTransactions,
  getBudgets,
  toThaiMonth,
  thaiMonthName,
} from "@/lib/personal-api"
import type { PersonalTransaction } from "@/lib/personal-types"
import { supabase } from "@/lib/supabase"
import { Printer } from "lucide-react"

const CategoryPieChart = dynamic(
  () =>
    import("@/components/personal/category-pie-chart").then(
      (m) => m.CategoryPieChart
    ),
  { ssr: false, loading: () => <div className="h-[300px]" /> }
)

const MonthlyComparisonChart = dynamic(
  () =>
    import("@/components/personal/monthly-comparison-chart").then(
      (m) => m.MonthlyComparisonChart
    ),
  { ssr: false, loading: () => <div className="h-[350px]" /> }
)

async function getMonthlyData(months: string[]) {
  const results: {
    month: string
    income: number
    expense: number
    net: number
  }[] = []

  for (const month of months) {
    const [thaiYear, m] = month.split("-")
    const ceYear = parseInt(thaiYear) - 543
    const startDate = `${ceYear}-${m}-01`
    const endDate =
      parseInt(m) === 12
        ? `${ceYear + 1}-01-01`
        : `${ceYear}-${String(parseInt(m) + 1).padStart(2, "0")}-01`

    const { data } = await supabase
      .from("personal_transactions")
      .select("type, amount")
      .gte("date", startDate)
      .lt("date", endDate)

    const income = (data || [])
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0)
    const expense = (data || [])
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0)

    results.push({ month: month.split("-")[1], income, expense, net: income - expense })
  }

  return results
}

export default function SummaryPage() {
  const [month, setMonth] = useState(() => toThaiMonth(new Date()))
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([])
  const [monthlyData, setMonthlyData] = useState<
    { month: string; income: number; expense: number; net: number }[]
  >([])
  const [budgetMap, setBudgetMap] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      // generate last 6 months
      const now = new Date()
      const months: string[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const thaiYear = d.getFullYear() + 543
        const m = String(d.getMonth() + 1).padStart(2, "0")
        months.push(`${thaiYear}-${m}`)
      }

      const [txs, monthly, budgets] = await Promise.all([
        getTransactions(month),
        getMonthlyData(months),
        getBudgets(month),
      ])

      setTransactions(txs)
      setMonthlyData(monthly)

      const bMap: Record<string, number> = {}
      budgets.forEach((b) => {
        bMap[b.category] = Number(b.budget_amount)
      })
      setBudgetMap(bMap)
    } catch (e) {
      console.error("Failed to load summary:", e)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    load()
  }, [load])

  // expense by category
  const expenseByCategory: Record<string, number> = {}
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseByCategory[t.category] =
        (expenseByCategory[t.category] || 0) + Number(t.amount)
    })

  const totalExpense = Object.values(expenseByCategory).reduce((s, v) => s + v, 0)

  const pieData = Object.entries(expenseByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0)

  const fmt = (n: number) =>
    n.toLocaleString("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">สรุปรายเดือน</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> พิมพ์รายงาน
          </Button>
          <MonthSelector value={month} onChange={setMonth} />
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <>
          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  รายรับเดือนนี้
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {fmt(totalIncome)} ฿
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  รายจ่ายเดือนนี้
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-red-500">
                  {fmt(totalExpense)} ฿
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  สุทธิ ({thaiMonthName(month)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {fmt(totalIncome - totalExpense)} ฿
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>เทียบรายรับ-รายจ่าย 6 เดือน</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyComparisonChart data={monthlyData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>สัดส่วนรายจ่ายตามหมวด</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryPieChart data={pieData} />
              </CardContent>
            </Card>
          </div>

          {/* Category Table */}
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดตามหมวด</CardTitle>
            </CardHeader>
            <CardContent>
              {pieData.length === 0 ? (
                <p className="text-muted-foreground">ไม่มีรายจ่ายในเดือนนี้</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-3">หมวด</th>
                        <th className="py-2 pr-3 text-right">จำนวน</th>
                        <th className="py-2 pr-3 text-right">%</th>
                        <th className="py-2 text-right">งบ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pieData.map(({ category, amount }) => {
                        const budget = budgetMap[category] || 0
                        const pct =
                          totalExpense > 0
                            ? ((amount / totalExpense) * 100).toFixed(1)
                            : "0"
                        return (
                          <tr key={category} className="border-b last:border-0">
                            <td className="py-2 pr-3 font-medium">{category}</td>
                            <td className="py-2 pr-3 text-right">
                              {fmt(amount)} ฿
                            </td>
                            <td className="py-2 pr-3 text-right">{pct}%</td>
                            <td className="py-2 text-right">
                              {budget > 0 ? (
                                <span
                                  className={
                                    amount > budget
                                      ? "text-red-500"
                                      : "text-green-600"
                                  }
                                >
                                  {fmt(budget)} ฿
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-bold">
                        <td className="py-2 pr-3">รวม</td>
                        <td className="py-2 pr-3 text-right">
                          {fmt(totalExpense)} ฿
                        </td>
                        <td className="py-2 pr-3 text-right">100%</td>
                        <td className="py-2 text-right">
                          {fmt(
                            Object.values(budgetMap).reduce((s, v) => s + v, 0)
                          )}{" "}
                          ฿
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Hidden Print Report */}
      <PrintReport
        month={thaiMonthName(month)}
        transactions={transactions}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
        budgetMap={budgetMap}
      />
    </div>
  )
}
