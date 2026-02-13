"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchMonitorData, type MonitorData } from "@/lib/api"
import { BarChart3, TrendingDown, TrendingUp, Users, RefreshCw } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

export default function DashboardPage() {
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
    const interval = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(interval)
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
  const branchChart = shop.branches.map((b) => ({
    name: b.name,
    income: b.income,
    expense: b.expense,
  }))

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {data.updated_label}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(shop.income)}</div>
            <p className="text-xs text-muted-foreground">{shop.date}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expense</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(shop.expense)}</div>
            <p className="text-xs text-muted-foreground">{shop.date}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${shop.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {shop.profit >= 0 ? "+" : ""}{fmt(shop.profit)}
            </div>
            <p className="text-xs text-muted-foreground">{shop.date}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Workers</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shop.workers}</div>
            <p className="text-xs text-muted-foreground">{fmt(shop.wages)} wages</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Branch Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Branch Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {branchChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={branchChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="income" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No branch data</p>
            )}
          </CardContent>
        </Card>

        {/* Stocks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stock Watchlist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.stocks.map((s) => (
              <div key={s.symbol} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.symbol}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-sm font-mono">
                    {s.price != null
                      ? `${s.currency === "THB" ? "฿" : "$"}${s.price.toLocaleString("en", { minimumFractionDigits: 2 })}`
                      : "N/A"}
                  </span>
                  <Badge variant={s.change > 0 ? "default" : s.change < 0 ? "destructive" : "secondary"} className="text-xs font-mono">
                    {s.change > 0 ? "+" : ""}{s.change}%
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Market Prices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Market Prices</CardTitle>
            <span className="text-xs text-muted-foreground">{data.market.date}</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.market.items.slice(0, 6).map((m) => (
                <div key={m.name} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{m.name}</span>
                  <span className="font-mono">{m.min}-{m.max} /{m.unit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* News */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">News</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.news.slice(0, 4).map((n, i) => (
                <div key={i}>
                  {n.url ? (
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                      {n.title}
                    </a>
                  ) : (
                    <span className="text-sm">{n.title}</span>
                  )}
                  {n.age && <span className="text-xs text-muted-foreground ml-2">{n.age}</span>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
