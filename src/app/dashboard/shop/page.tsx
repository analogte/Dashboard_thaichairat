"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitorData } from "@/hooks/use-monitor-data"
import { fmt } from "@/lib/utils"
import { Store, RefreshCw, TrendingUp, TrendingDown, Users } from "lucide-react"

export default function ShopPage() {
  const { data, loading, refresh } = useMonitorData()

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
        <button onClick={refresh} className="text-sm underline">
          Retry
        </button>
      </div>
    )
  }

  const shop = data.shop
  const maxIncome = Math.max(...shop.branches.map((b) => b.income), 1)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Shop Overview</h1>
            <p className="text-sm text-muted-foreground">{shop.date}</p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition rounded-lg border border-border px-3 py-1.5 hover:bg-accent"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Income
            </CardTitle>
            <div className="rounded-full bg-emerald-500/10 p-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ฿{fmt(shop.income)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Expense
            </CardTitle>
            <div className="rounded-full bg-red-500/10 p-1.5">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ฿{fmt(shop.expense)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Profit
            </CardTitle>
            <div className="rounded-full bg-blue-500/10 p-1.5">
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${shop.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}
            >
              {shop.profit >= 0 ? "+" : "-"}฿{fmt(Math.abs(shop.profit))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branches + Workers */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shop.branches.length > 0 ? (
                shop.branches.map((b) => (
                  <div
                    key={b.name}
                    className="space-y-2 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{b.name}</p>
                      <Badge
                        variant="secondary"
                        className={
                          b.profit >= 0
                            ? "bg-emerald-500/15 text-emerald-400"
                            : "bg-red-500/15 text-red-400"
                        }
                      >
                        {b.profit >= 0 ? "+" : "-"}฿{fmt(Math.abs(b.profit))}
                      </Badge>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500/70"
                            style={{
                              width: `${(b.income / maxIncome) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground w-28 text-right">
                        ฿{fmt(b.income)} / ฿{fmt(b.expense)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No branch data for today
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Workers</CardTitle>
            <div className="rounded-full bg-violet-500/10 p-1.5">
              <Users className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <div className="text-5xl font-bold">{shop.workers}</div>
              <p className="text-sm text-muted-foreground">employees</p>
              <div className="mt-4 w-full border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total wages</span>
                  <span className="font-mono font-medium">
                    ฿{fmt(shop.wages)}
                  </span>
                </div>
                {shop.workers > 0 && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Avg per worker</span>
                    <span className="font-mono font-medium">
                      ฿{fmt(Math.round(shop.wages / shop.workers))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
