"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMonitor } from "@/lib/monitor-context"
import {
  getTransactions,
  getRoutines,
  getTemplates,
  getSavingsGoals,
  toThaiMonth,
} from "@/lib/personal-api"
import { Store, Wallet, CalendarCheck, Gem } from "lucide-react"

export default function PersonalOverviewPage() {
  const { data: monitorData } = useMonitor()
  const [financeData, setFinanceData] = useState({ income: 0, expense: 0 })
  const [routineData, setRoutineData] = useState({ done: 0, total: 0 })
  const [savingsData, setSavingsData] = useState({ current: 0, target: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const month = toThaiMonth(new Date())

      const [txs, routines, templates, goals] = await Promise.all([
        getTransactions(month),
        getRoutines(today),
        getTemplates(),
        getSavingsGoals(),
      ])

      setFinanceData({
        income: txs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        expense: txs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      })

      setRoutineData({
        done: routines.filter((r) => r.done).length,
        total: templates.length,
      })

      setSavingsData({
        current: goals.reduce((s, g) => s + Number(g.current_amount), 0),
        target: goals.reduce((s, g) => s + Number(g.target_amount), 0),
      })
    } catch (e) {
      console.error("Failed to load overview:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  const shopToday = monitorData?.shop
  const routinePercent = routineData.total > 0
    ? Math.round((routineData.done / routineData.total) * 100)
    : 0
  const savingsPercent = savingsData.target > 0
    ? Math.round((savingsData.current / savingsData.target) * 100)
    : 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-bold">ภาพรวมชีวิต</h1>

      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Shop Today */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Store className="h-4 w-4" />
                ร้านวันนี้
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shopToday?.has_data ? (
                <div className="space-y-1">
                  <p className="text-2xl font-bold">
                    <span className="text-green-600">+{fmt(shopToday.income)}</span>
                    <span className="text-muted-foreground mx-2">/</span>
                    <span className="text-red-500">-{fmt(shopToday.expense)}</span>
                  </p>
                  <p className={`text-lg font-medium ${shopToday.profit >= 0 ? "text-green-600" : "text-red-500"}`}>
                    กำไร {fmt(shopToday.profit)} ฿
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">ยังไม่มีข้อมูลวันนี้</p>
              )}
            </CardContent>
          </Card>

          {/* Finance This Month */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                การเงินเดือนนี้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  <span className="text-green-600">+{fmt(financeData.income)}</span>
                  <span className="text-muted-foreground mx-2">/</span>
                  <span className="text-red-500">-{fmt(financeData.expense)}</span>
                </p>
                <p className={`text-lg font-medium ${financeData.income - financeData.expense >= 0 ? "text-green-600" : "text-red-500"}`}>
                  สุทธิ {fmt(financeData.income - financeData.expense)} ฿
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Routine Today */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" />
                กิจวัตรวันนี้
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">
                  {routineData.done}/{routineData.total}
                  <span className="text-lg text-muted-foreground ml-2">({routinePercent}%)</span>
                </p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${routinePercent >= 80 ? "bg-green-500" : routinePercent >= 40 ? "bg-yellow-400" : "bg-red-400"}`}
                    style={{ width: `${routinePercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Gem className="h-4 w-4" />
                เป้าหมายออม
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">
                  {fmt(savingsData.current)} ฿
                  <span className="text-lg text-muted-foreground ml-2">/ {fmt(savingsData.target)} ฿</span>
                </p>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${savingsPercent >= 100 ? "bg-green-500" : "bg-blue-500"}`}
                    style={{ width: `${Math.min(100, savingsPercent)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{savingsPercent}% ของเป้าหมาย</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
