"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitor } from "@/lib/monitor-context"
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Percent,
  CalendarRange,
  AlertTriangle,
  ChevronRight,
  PiggyBank,
  CreditCard,
  HandCoins,
  Users,
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

const MiniTrendChart = dynamic(() => import("./mini-trend-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
      กำลังโหลด...
    </div>
  ),
})

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

function ChangeBadge({ pct }: { pct: number | null | undefined }) {
  if (pct == null || isNaN(pct)) return null
  const isUp = pct >= 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp ? "text-green-500" : "text-red-500"
      }`}
    >
      {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {isUp ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  )
}

interface QuickAlert {
  severity: "danger" | "warning"
  category: string
}

function collectAlerts(data: NonNullable<ReturnType<typeof useMonitor>["data"]>): QuickAlert[] {
  const alerts: QuickAlert[] = []

  // Low stock
  if (data.inventory?.low_stock) {
    for (const item of data.inventory.low_stock) {
      alerts.push({ severity: "danger", category: "stock" })
    }
  }

  // Stock predictions
  if (data.stock_history?.predictions) {
    for (const p of data.stock_history.predictions) {
      if (p.suggest_order) {
        alerts.push({ severity: p.days_until_zero <= 1 ? "danger" : "warning", category: "stock" })
      }
    }
  }

  // Supplier debt
  if (data.payables_data?.suppliers) {
    for (const s of data.payables_data.suppliers) {
      if (s.balance >= 20000) alerts.push({ severity: "danger", category: "payable" })
      else if (s.balance >= 10000) alerts.push({ severity: "warning", category: "payable" })
    }
  }

  // Customer credits
  if (data.credits_data?.customers) {
    for (const c of data.credits_data.customers) {
      if (c.balance >= 5000) alerts.push({ severity: "danger", category: "credit" })
      else if (c.balance >= 2000) alerts.push({ severity: "warning", category: "credit" })
    }
  }

  // Market volatility
  if (data.market_stats?.alerts) {
    for (const a of data.market_stats.alerts) {
      alerts.push({ severity: Math.abs(a.change_pct) >= 20 ? "danger" : "warning", category: "market" })
    }
  }

  // Wage budget
  if (data.employee_stats?.monthly_summary) {
    const pct = data.employee_stats.monthly_summary.budget_used_pct
    if (pct > 90) alerts.push({ severity: "danger", category: "wage" })
    else if (pct > 70) alerts.push({ severity: "warning", category: "wage" })
  }

  // Savings risk
  if (data.savings_data) {
    if (data.savings_data.risk === "danger") alerts.push({ severity: "danger", category: "savings" })
    else if (data.savings_data.risk === "caution") alerts.push({ severity: "warning", category: "savings" })
  }

  // System health
  if (data.system_health) {
    for (const s of data.system_health.services) {
      if (s.status !== "running") alerts.push({ severity: "danger", category: "system" })
    }
    for (const p of data.system_health.ports) {
      if (!p.open) alerts.push({ severity: "danger", category: "system" })
    }
    if (data.system_health.cpu_pct >= 90) alerts.push({ severity: "danger", category: "system" })
    if (data.system_health.ram_pct >= 90) alerts.push({ severity: "warning", category: "system" })
    if (data.system_health.disk_pct >= 80) {
      alerts.push({ severity: data.system_health.disk_pct >= 90 ? "danger" : "warning", category: "system" })
    }
  }

  return alerts
}

const CATEGORY_LABELS: Record<string, string> = {
  stock: "สต็อก",
  payable: "หนี้ supplier",
  credit: "ลูกหนี้",
  market: "ราคาตลาด",
  wage: "ค่าแรง",
  savings: "เงินเก็บ",
  system: "ระบบ",
}

export default function DashboardPage() {
  const { data, loading, refresh: load } = useMonitor()

  const alerts = useMemo(() => (data ? collectAlerts(data) : []), [data])
  const { dangerCount, alertCategories } = useMemo(() => {
    let danger = 0
    const cats = new Set<string>()
    for (const a of alerts) {
      if (a.severity === "danger") danger++
      cats.add(CATEGORY_LABELS[a.category] || a.category)
    }
    return { dangerCount: danger, alertCategories: [...cats] }
  }, [alerts])

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
  const weekSummary = data.shop_history.week
  const monthSummary = data.shop_history.month
  const daily = data.shop_history.daily
  const pnl = data.pnl_data
  const savings = data.savings_data
  const payables = data.payables_data
  const credits = data.credits_data
  const empStats = data.employee_stats

  // Compute margin
  const margin = shop.income > 0 ? (shop.profit / shop.income) * 100 : 0

  // Month profit from PnL or shop_history
  const monthProfit = pnl?.months?.length
    ? pnl.months[pnl.months.length - 1].net_profit
    : monthSummary.profit

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            สวัสดีครับ เจ้าของ
          </h1>
          <p className="text-sm text-muted-foreground">{data.updated_label}</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          รีเฟรช
        </button>
      </div>

      {/* ── KPI Row ── */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* รายรับ */}
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">รายรับ</span>
              <div className="rounded-full bg-green-500/10 p-1">
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">{fmt(shop.income)}</div>
            <ChangeBadge pct={weekSummary.change_pct} />
          </CardContent>
        </Card>

        {/* รายจ่าย */}
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">รายจ่าย</span>
              <div className="rounded-full bg-red-500/10 p-1">
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">{fmt(shop.expense)}</div>
            <span className="text-xs text-muted-foreground">{shop.date}</span>
          </CardContent>
        </Card>

        {/* กำไรวันนี้ */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">กำไรวันนี้</span>
              <div className="rounded-full bg-blue-500/10 p-1">
                <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${shop.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {shop.profit >= 0 ? "+" : ""}
              {fmt(shop.profit)}
            </div>
            <ChangeBadge pct={weekSummary.change_pct} />
          </CardContent>
        </Card>

        {/* มาร์จิ้น */}
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">มาร์จิ้น</span>
              <div className="rounded-full bg-amber-500/10 p-1">
                <Percent className="h-3.5 w-3.5 text-amber-500" />
              </div>
            </div>
            <div className="text-2xl font-bold">{margin.toFixed(1)}%</div>
            <span className="text-xs text-muted-foreground">กำไร/รายรับ</span>
          </CardContent>
        </Card>

        {/* กำไรเดือนนี้ */}
        <Card className="border-l-4 border-l-purple-500 col-span-2 md:col-span-1">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">กำไรเดือนนี้</span>
              <div className="rounded-full bg-purple-500/10 p-1">
                <CalendarRange className="h-3.5 w-3.5 text-purple-500" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${monthProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {monthProfit >= 0 ? "+" : ""}
              {fmt(monthProfit)}
            </div>
            <ChangeBadge pct={pnl?.change_pct ?? monthSummary.change_pct} />
          </CardContent>
        </Card>
      </div>

      {/* ── Quick Alerts Banner ── */}
      {alerts.length > 0 && (
        <Link href="/dashboard/alerts">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors hover:bg-muted/50 ${
              dangerCount > 0
                ? "border-red-500/30 bg-red-500/5"
                : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            <AlertTriangle
              className={`h-5 w-5 shrink-0 ${dangerCount > 0 ? "text-red-500" : "text-amber-500"}`}
            />
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium">
                {alerts.length} เรื่องต้องดู
                {dangerCount > 0 && (
                  <span className="text-red-500 ml-1">({dangerCount} วิกฤต)</span>
                )}
              </span>
              <span className="text-xs text-muted-foreground ml-2">
                {alertCategories.join(" | ")}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </Link>
      )}

      {/* ── Trend + Financial Health ── */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Left: Trend Summary */}
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">สรุปแนวโน้ม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mini chart */}
            {daily.length > 0 && (
              <MiniTrendChart data={daily.slice(-7)} />
            )}

            {/* Week + Month summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  สัปดาห์นี้ ({weekSummary.days} วัน)
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">รายรับ</span>
                    <span className="font-mono">{fmt(weekSummary.income)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">รายจ่าย</span>
                    <span className="font-mono">{fmt(weekSummary.expense)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>กำไร</span>
                    <span className={weekSummary.profit >= 0 ? "text-green-500" : "text-red-500"}>
                      {weekSummary.profit >= 0 ? "+" : ""}{fmt(weekSummary.profit)}
                    </span>
                  </div>
                  {weekSummary.change_pct != null && (
                    <div className="pt-0.5">
                      <ChangeBadge pct={weekSummary.change_pct} />
                      <span className="text-xs text-muted-foreground ml-1">vs สัปดาห์ก่อน</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  เดือนนี้ ({monthSummary.days} วัน)
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">รายรับ</span>
                    <span className="font-mono">{fmt(monthSummary.income)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">รายจ่าย</span>
                    <span className="font-mono">{fmt(monthSummary.expense)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>กำไร</span>
                    <span className={monthSummary.profit >= 0 ? "text-green-500" : "text-red-500"}>
                      {monthSummary.profit >= 0 ? "+" : ""}{fmt(monthSummary.profit)}
                    </span>
                  </div>
                  {monthSummary.change_pct != null && (
                    <div className="pt-0.5">
                      <ChangeBadge pct={monthSummary.change_pct} />
                      <span className="text-xs text-muted-foreground ml-1">vs เดือนก่อน</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Financial Health */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">สุขภาพการเงิน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Savings */}
            {savings && (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-500/10 p-1.5 mt-0.5">
                  <PiggyBank className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">เงินเก็บ</span>
                    <Badge
                      variant={savings.risk === "safe" ? "secondary" : "destructive"}
                      className={`text-xs ${
                        savings.risk === "safe"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : savings.risk === "caution"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : ""
                      }`}
                    >
                      {savings.risk === "safe" ? "ปลอดภัย" : savings.risk === "caution" ? "ระวัง" : "อันตราย"}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold">{fmt(savings.total)} <span className="text-xs font-normal text-muted-foreground">บาท</span></p>
                  <p className="text-xs text-muted-foreground">ครอบคลุม {savings.cover_days} วัน</p>
                </div>
              </div>
            )}

            {/* Payables */}
            {payables && (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-red-500/10 p-1.5 mt-0.5">
                  <CreditCard className="h-4 w-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground">หนี้ supplier</span>
                  <p className="text-lg font-bold">{fmt(payables.total_outstanding)} <span className="text-xs font-normal text-muted-foreground">บาท</span></p>
                  <p className="text-xs text-muted-foreground">{payables.count} ราย</p>
                </div>
              </div>
            )}

            {/* Credits */}
            {credits && (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-500/10 p-1.5 mt-0.5">
                  <HandCoins className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-muted-foreground">ลูกหนี้</span>
                  <p className="text-lg font-bold">{fmt(credits.total_outstanding)} <span className="text-xs font-normal text-muted-foreground">บาท</span></p>
                  <p className="text-xs text-muted-foreground">{credits.count} ราย</p>
                </div>
              </div>
            )}

            {/* Wage Budget */}
            {empStats?.monthly_summary && (
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-purple-500/10 p-1.5 mt-0.5">
                  <Users className="h-4 w-4 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">งบค่าแรง</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {empStats.monthly_summary.budget_used_pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        empStats.monthly_summary.budget_used_pct > 90
                          ? "bg-red-500"
                          : empStats.monthly_summary.budget_used_pct > 70
                          ? "bg-amber-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(empStats.monthly_summary.budget_used_pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {fmt(empStats.monthly_summary.total_wages_paid)} / {fmt(empStats.budget)} บาท
                  </p>
                </div>
              </div>
            )}

            {/* Fallback when no financial data */}
            {!savings && !payables && !credits && !empStats && (
              <p className="text-sm text-muted-foreground text-center py-4">ไม่มีข้อมูลการเงิน</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Branch Chart + Stocks ── */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">ผลประกอบการสาขา</CardTitle>
          </CardHeader>
          <CardContent>
            <BranchChart branches={shop.branches} />
          </CardContent>
        </Card>

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
              {data.stocks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีหุ้น</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Market + News ── */}
      <div className="grid gap-4 md:grid-cols-5">
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
              {(() => {
                const items6 = data.market.items.slice(0, 6)
                const maxPrice = Math.max(...items6.map((i) => i.max))
                return items6.map((m) => {
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
              })
              })()}
              {data.market.items.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีข้อมูลราคา</p>
              )}
            </div>
          </CardContent>
        </Card>

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
