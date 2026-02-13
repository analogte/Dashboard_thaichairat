"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitor } from "@/lib/monitor-context"
import {
  BarChart3,
  TrendingDown,
  TrendingUp,
  Users,
  RefreshCw,
  ExternalLink,
  Newspaper,
  ShoppingBasket,
} from "lucide-react"

const BranchChart = dynamic(() => import("@/components/branch-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
      กำลังโหลดกราฟ...
    </div>
  ),
})

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

export default function DashboardPage() {
  const { data, loading, refresh: load } = useMonitor()

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
        <p className="text-muted-foreground">ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์</p>
        <button onClick={load} className="text-sm underline">
          ลองใหม่
        </button>
      </div>
    )
  }

  const shop = data.shop

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ภาพรวม</h1>
          <p className="text-sm text-muted-foreground">{data.updated_label}</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          รีเฟรช
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รายรับ</CardTitle>
            <div className="rounded-full bg-green-500/10 p-1.5">
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(shop.income)}</div>
            <p className="text-xs text-muted-foreground mt-1">{shop.date}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">รายจ่าย</CardTitle>
            <div className="rounded-full bg-red-500/10 p-1.5">
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fmt(shop.expense)}</div>
            <p className="text-xs text-muted-foreground mt-1">{shop.date}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">กำไร</CardTitle>
            <div className="rounded-full bg-blue-500/10 p-1.5">
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${shop.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {shop.profit >= 0 ? "+" : ""}
              {fmt(shop.profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{shop.date}</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">พนักงาน</CardTitle>
            <div className="rounded-full bg-purple-500/10 p-1.5">
              <Users className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shop.workers}</div>
            <p className="text-xs text-muted-foreground mt-1">{fmt(shop.wages)} บาท ค่าแรง</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Branch Performance — wider */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">ผลประกอบการสาขา</CardTitle>
          </CardHeader>
          <CardContent>
            <BranchChart branches={shop.branches} />
          </CardContent>
        </Card>

        {/* Stock Watchlist — narrower */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              หุ้นที่ติดตาม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {data.stocks.map((s) => (
                <div key={s.symbol} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.symbol}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <span className="text-sm font-mono">
                      {s.price != null
                        ? `${s.currency === "THB" ? "\u0E3F" : "$"}${s.price.toLocaleString("en", { minimumFractionDigits: 2 })}`
                        : "N/A"}
                    </span>
                    <Badge
                      variant={s.change > 0 ? "default" : s.change < 0 ? "destructive" : "secondary"}
                      className="text-xs font-mono min-w-[52px] justify-center"
                    >
                      {s.change > 0 ? "+" : ""}
                      {s.change}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Market Prices — wider */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBasket className="h-4 w-4" />
              ราคาตลาด
            </CardTitle>
            <span className="text-xs text-muted-foreground">{data.market.date}</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.market.items.slice(0, 6).map((m) => {
                const maxPrice = Math.max(...data.market.items.slice(0, 6).map((i) => i.max))
                const pct = maxPrice > 0 ? (m.max / maxPrice) * 100 : 0
                return (
                  <div key={m.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{m.name}</span>
                      <span className="font-mono text-xs">
                        {m.min}-{m.max} /{m.unit}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500/60"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* News — narrower */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              ข่าวสาร
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {data.news.slice(0, 4).map((n, i) => (
                <div key={i} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      {n.url ? (
                        <a
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:underline line-clamp-2"
                        >
                          {n.title}
                        </a>
                      ) : (
                        <span className="text-sm line-clamp-2">{n.title}</span>
                      )}
                      {n.age && <p className="text-xs text-muted-foreground mt-0.5">{n.age}</p>}
                    </div>
                    {n.url && (
                      <a href={n.url} target="_blank" rel="noopener noreferrer" className="shrink-0 mt-0.5">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {data.news.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีข่าว</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
