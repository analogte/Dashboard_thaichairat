"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitorData } from "@/hooks/use-monitor-data"
import { fmt } from "@/lib/utils"
import {
  TrendingDown,
  TrendingUp,
  Users,
  RefreshCw,
  ArrowRight,
  CircleDollarSign,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

export default function DashboardPage() {
  const { data, loading, refresh } = useMonitorData(5 * 60 * 1000)

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
          onClick={refresh}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition rounded-lg border border-border px-3 py-1.5 hover:bg-accent"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Revenue
            </CardTitle>
            <div className="rounded-full bg-emerald-500/10 p-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{fmt(shop.income)}</div>
            <p className="text-xs text-muted-foreground mt-1">{shop.date}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expense
            </CardTitle>
            <div className="rounded-full bg-red-500/10 p-1.5">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{fmt(shop.expense)}</div>
            <p className="text-xs text-muted-foreground mt-1">{shop.date}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Profit
            </CardTitle>
            <div className="rounded-full bg-blue-500/10 p-1.5">
              <CircleDollarSign className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${shop.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}
            >
              {shop.profit >= 0 ? "+" : "-"}฿{fmt(Math.abs(shop.profit))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{shop.date}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Workers
            </CardTitle>
            <div className="rounded-full bg-violet-500/10 p-1.5">
              <Users className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shop.workers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ฿{fmt(shop.wages)} wages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Stocks Row - Asymmetric 3:2 */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Branch Performance</CardTitle>
            <Link
              href="/dashboard/shop"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
            >
              View details <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {branchChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={branchChart} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="var(--muted-foreground)"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    stroke="var(--muted-foreground)"
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      color: "var(--card-foreground)",
                      fontSize: 13,
                    }}
                    formatter={(value: number) => [
                      `฿${Number(value).toLocaleString("th-TH")}`,
                    ]}
                  />
                  <Legend iconType="circle" iconSize={8} />
                  <Bar
                    dataKey="income"
                    fill="#34d399"
                    radius={[6, 6, 0, 0]}
                    name="Income"
                  />
                  <Bar
                    dataKey="expense"
                    fill="#f87171"
                    radius={[6, 6, 0, 0]}
                    name="Expense"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">
                No branch data
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Stock Watchlist</CardTitle>
            <Link
              href="/dashboard/stocks"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {data.stocks.map((s) => (
                <div
                  key={s.symbol}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
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
                    <Badge
                      variant="secondary"
                      className={`text-xs font-mono ${
                        s.change > 0
                          ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                          : s.change < 0
                            ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                            : ""
                      }`}
                    >
                      {s.change > 0 ? "+" : ""}
                      {s.change}%
                    </Badge>
                  </div>
                </div>
              ))}
              {data.stocks.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No stock data
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market + News Row - Asymmetric 3:2 */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Market Prices</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {data.market.date}
              </p>
            </div>
            <Link
              href="/dashboard/market"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.market.items.slice(0, 6).map((m) => {
                const avg = (m.min + m.max) / 2
                const maxPrice = Math.max(
                  ...data.market.items.map((i) => i.max)
                )
                const pct = maxPrice > 0 ? (avg / maxPrice) * 100 : 0
                return (
                  <div key={m.name} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-28 shrink-0 truncate">
                      {m.name}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500/70"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-right w-24 shrink-0">
                      {m.min}-{m.max} /{m.unit}
                    </span>
                  </div>
                )
              })}
              {data.market.items.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No market data
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">News</CardTitle>
            <Link
              href="/dashboard/news"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {data.news.slice(0, 5).map((n, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  {n.url ? (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline line-clamp-2 leading-snug"
                    >
                      {n.title}
                    </a>
                  ) : (
                    <p className="text-sm line-clamp-2 leading-snug">
                      {n.title}
                    </p>
                  )}
                  {n.age && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {n.age}
                    </p>
                  )}
                </div>
              ))}
              {data.news.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No news
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
