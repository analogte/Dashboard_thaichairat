"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchMonitorData, type MonitorData } from "@/lib/api"
import { Store, RefreshCw } from "lucide-react"

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

export default function ShopPage() {
  const [data, setData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const d = await fetchMonitorData()
    setData(d)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">Cannot connect to server</p>
        <button onClick={load} className="text-sm underline">Retry</button>
      </div>
    )
  }

  const shop = data.shop

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Store className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Shop Overview</h1>
          <p className="text-sm text-muted-foreground">{shop.date}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{fmt(shop.income)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{fmt(shop.expense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${shop.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {shop.profit >= 0 ? "+" : ""}{fmt(shop.profit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Branches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shop.branches.length > 0 ? (
              shop.branches.map((b) => (
                <div key={b.name} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">{b.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Income: {fmt(b.income)} | Expense: {fmt(b.expense)}
                    </p>
                  </div>
                  <Badge variant={b.profit >= 0 ? "default" : "destructive"}>
                    {b.profit >= 0 ? "+" : ""}{fmt(b.profit)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No branch data for today</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold">{shop.workers}</div>
            <div className="text-sm text-muted-foreground">
              Total wages: {fmt(shop.wages)} baht
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
