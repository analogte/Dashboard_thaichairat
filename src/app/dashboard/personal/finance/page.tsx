"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MonthSelector } from "@/components/personal/month-selector"
import { TransactionForm } from "@/components/personal/transaction-form"
import {
  getTransactions,
  addTransaction,
  deleteTransaction,
  toThaiMonth,
  toThaiDate,
} from "@/lib/personal-api"
import type { PersonalTransaction } from "@/lib/personal-types"
import { Trash2, Download, Store } from "lucide-react"
import { exportCSV } from "@/lib/export"
import { FavoritesBar } from "@/components/personal/favorites-bar"
import { useMonitor } from "@/lib/monitor-context"

export default function FinancePage() {
  const [month, setMonth] = useState(() => toThaiMonth(new Date()))
  const [transactions, setTransactions] = useState<PersonalTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const { data: monitorData } = useMonitor()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTransactions(month)
      setTransactions(data)
    } catch (e) {
      console.error("Failed to load transactions:", e)
    } finally {
      setLoading(false)
    }
  }, [month])

  useEffect(() => {
    load()
  }, [load])

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const balance = totalIncome - totalExpense

  async function handleAdd(data: {
    date: string
    type: "income" | "expense"
    amount: number
    category: string
    note: string
  }) {
    await addTransaction(data)
    load()
  }

  async function handleDelete(id: number) {
    await deleteTransaction(id)
    load()
  }

  async function handleSyncShop() {
    if (!monitorData?.shop_history?.daily) return
    const existingDates = new Set(
      transactions
        .filter((t) => t.type === "income" && t.category === "รายได้จากร้าน")
        .map((t) => t.date)
    )
    const toSync = monitorData.shop_history.daily.filter(
      (d) => d.profit > 0 && !existingDates.has(d.date)
    )
    if (toSync.length === 0) {
      alert("ไม่มีข้อมูลใหม่ให้ดึง")
      return
    }
    if (!confirm(`จะดึงรายได้ร้าน ${toSync.length} วัน เข้าระบบ?`)) return
    setSyncing(true)
    for (const day of toSync) {
      await addTransaction({
        date: day.date,
        type: "income",
        amount: day.profit,
        category: "รายได้จากร้าน",
        note: `กำไรร้าน (รับ ${day.income.toLocaleString()} จ่าย ${day.expense.toLocaleString()})`,
      })
    }
    setSyncing(false)
    load()
  }

  // group by date
  const grouped = transactions.reduce<Record<string, PersonalTransaction[]>>(
    (acc, tx) => {
      const key = tx.date
      if (!acc[key]) acc[key] = []
      acc[key].push(tx)
      return acc
    },
    {}
  )

  const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">รายรับ-รายจ่าย</h1>
        <div className="flex items-center gap-2">
          {monitorData?.shop_history?.daily && (
            <Button variant="outline" size="sm" onClick={handleSyncShop} disabled={syncing}>
              <Store className="h-4 w-4 mr-1" />
              {syncing ? "กำลังดึง..." : "ดึงรายได้ร้าน"}
            </Button>
          )}
          {transactions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportCSV(
                  `finance-${month}`,
                  ["วันที่", "ประเภท", "หมวด", "จำนวน", "หมายเหตุ"],
                  transactions,
                  ["date", "type", "category", "amount", "note"]
                )
              }
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
          )}
          <MonthSelector value={month} onChange={setMonth} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              รวมรายรับ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              +{fmt(totalIncome)} ฿
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              รวมรายจ่าย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              -{fmt(totalExpense)} ฿
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              คงเหลือ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-500"}`}
            >
              {balance >= 0 ? "+" : ""}
              {fmt(balance)} ฿
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Favorites */}
      <FavoritesBar
        onQuickAdd={async (data) => {
          await handleAdd({
            date: new Date().toISOString().split("T")[0],
            ...data,
          })
        }}
      />

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>บันทึกรายการ</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm onSubmit={handleAdd} />
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader>
          <CardTitle>
            รายการทั้งหมด ({transactions.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">กำลังโหลด...</p>
          ) : transactions.length === 0 ? (
            <p className="text-muted-foreground">ไม่มีรายการในเดือนนี้</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, txs]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      {toThaiDate(date)}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <tbody>
                          {txs.map((tx) => (
                            <tr
                              key={tx.id}
                              className="border-b last:border-0 hover:bg-muted/50"
                            >
                              <td className="py-2 pr-3">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full mr-2 ${tx.type === "income" ? "bg-green-500" : "bg-red-500"}`}
                                />
                                {tx.category}
                              </td>
                              <td className="py-2 pr-3 text-muted-foreground">
                                {tx.note}
                              </td>
                              <td
                                className={`py-2 pr-3 text-right font-medium whitespace-nowrap ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}
                              >
                                {tx.type === "income" ? "+" : "-"}
                                {fmt(Number(tx.amount))} ฿
                              </td>
                              <td className="py-2 w-8">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-red-500"
                                  onClick={() => handleDelete(tx.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
