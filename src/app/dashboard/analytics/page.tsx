"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitor } from "@/lib/monitor-context"
import { exportCSV } from "@/lib/export"
import {
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  ArrowUpFromLine,
  ArrowDownToLine,
  Download,
  ShoppingCart,
} from "lucide-react"

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 1 })
}

function fmtB(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

export default function AnalyticsPage() {
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
        <button onClick={load} className="text-sm underline">ลองใหม่</button>
      </div>
    )
  }

  const sh = data.stock_history
  const inv = data.inventory

  if (!sh) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">วิเคราะห์สินค้า</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <p className="text-muted-foreground">ไม่มีข้อมูลสต็อก — กรุณารัน update_monitor.py ใหม่</p>
          <button onClick={load} className="text-sm underline">ลองใหม่</button>
        </div>
      </div>
    )
  }

  const topSellers = useMemo(
    () => [...sh.top_movers].sort((a, b) => b.total_sold - a.total_sold).slice(0, 10),
    [sh.top_movers]
  )
  const topReceived = useMemo(
    () => [...sh.top_movers].sort((a, b) => b.total_received - a.total_received).slice(0, 10),
    [sh.top_movers]
  )
  const { needOrder, safeStock } = useMemo(() => {
    const need: typeof sh.predictions = []
    const safe: typeof sh.predictions = []
    for (const p of sh.predictions) {
      if (p.suggest_order) need.push(p)
      else safe.push(p)
    }
    return { needOrder: need, safeStock: safe }
  }, [sh.predictions])

  // Category breakdown
  const { categories, totalSold, totalReceived } = useMemo(() => {
    const catMap = new Map<string, { sold: number; received: number; count: number }>()
    let sold = 0
    let received = 0
    for (const m of sh.top_movers) {
      const cat = m.category || "อื่นๆ"
      const prev = catMap.get(cat) || { sold: 0, received: 0, count: 0 }
      catMap.set(cat, {
        sold: prev.sold + m.total_sold,
        received: prev.received + m.total_received,
        count: prev.count + 1,
      })
      sold += m.total_sold
      received += m.total_received
    }
    const cats = [...catMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.sold - a.sold)
    return { categories: cats, totalSold: sold, totalReceived: received }
  }, [sh.top_movers])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">วิเคราะห์สินค้า</h1>
            <p className="text-sm text-muted-foreground">{data.updated_label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportCSV("product-analytics", ["สินค้า", "ขาย", "รับเข้า", "หน่วย", "หมวด", "วัน", "เฉลี่ย/วัน"],
                sh.top_movers, ["product", "total_sold", "total_received", "unit", "category", "days", "avg_daily"])
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              สินค้าทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{sh.top_movers.length}</span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ArrowUpFromLine className="h-3.5 w-3.5" />
              ขายรวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{fmtB(totalSold)}</span>
            <span className="text-sm text-muted-foreground ml-2">หน่วย</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ArrowDownToLine className="h-3.5 w-3.5" />
              รับเข้ารวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{fmtB(totalReceived)}</span>
            <span className="text-sm text-muted-foreground ml-2">หน่วย</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              ต้องสั่งซื้อ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{needOrder.length}</span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              สินค้าขายดี Top 10
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSellers.map((m, i) => {
                const maxSold = topSellers[0]?.total_sold || 1
                const pct = (m.total_sold / maxSold) * 100
                return (
                  <div key={m.product} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                        <span className="font-medium">{m.product}</span>
                        <Badge variant="outline" className="text-[10px]">{m.category}</Badge>
                      </span>
                      <span className="font-mono">{fmt(m.total_sold)} {m.unit}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Received */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4 text-purple-500" />
              รับเข้ามากสุด Top 10
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topReceived.map((m, i) => {
                const maxRcv = topReceived[0]?.total_received || 1
                const pct = (m.total_received / maxRcv) * 100
                return (
                  <div key={m.product} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-5">{i + 1}.</span>
                        <span className="font-medium">{m.product}</span>
                        <Badge variant="outline" className="text-[10px]">{m.category}</Badge>
                      </span>
                      <span className="font-mono">{fmt(m.total_received)} {m.unit}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              สัดส่วนตามหมวดหมู่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((cat) => {
                const pct = totalSold > 0 ? (cat.sold / totalSold) * 100 : 0
                return (
                  <div key={cat.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{cat.name} <span className="text-xs text-muted-foreground">({cat.count} รายการ)</span></span>
                      <span className="font-mono">{fmtB(cat.sold)} <span className="text-xs text-muted-foreground">({pct.toFixed(0)}%)</span></span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stock Predictions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              พยากรณ์สต็อก
              {needOrder.length > 0 && (
                <Badge variant="destructive" className="text-[10px]">{needOrder.length} ต้องสั่ง</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {needOrder.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">สต็อกเพียงพอทุกรายการ</p>
              ) : (
                [...needOrder].sort((a, b) => a.days_until_zero - b.days_until_zero).map((p) => (
                  <div key={p.product} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 last:pb-0">
                    <div>
                      <span className="font-medium">{p.product}</span>
                      <span className="text-xs text-muted-foreground ml-2">คงเหลือ {fmt(p.current_stock)} {p.unit}</span>
                    </div>
                    <Badge
                      variant={p.days_until_zero <= 2 ? "destructive" : "outline"}
                      className="text-xs"
                    >
                      {p.days_until_zero <= 0 ? "หมดแล้ว" : `${p.days_until_zero} วัน`}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Summary Table */}
      {sh.daily_summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              สรุปรายวัน (ย้อนหลัง)
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-4">วันที่</th>
                  <th className="text-right py-2 px-2">รับเข้า</th>
                  <th className="text-right py-2 px-2">ขายออก</th>
                  <th className="text-right py-2 px-2">รายการ</th>
                  <th className="text-right py-2 px-2">ต้นทุน (ปร.)</th>
                  <th className="text-right py-2 pl-2">รายรับ (ปร.)</th>
                </tr>
              </thead>
              <tbody>
                {sh.daily_summary.slice(-14).reverse().map((d) => (
                  <tr key={d.date} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{d.date}</td>
                    <td className="text-right py-2 px-2 font-mono">{fmtB(d.total_received)}</td>
                    <td className="text-right py-2 px-2 font-mono">{fmtB(d.total_sold)}</td>
                    <td className="text-right py-2 px-2">{d.items}</td>
                    <td className="text-right py-2 px-2 font-mono">{fmtB(d.est_cogs)}</td>
                    <td className="text-right py-2 pl-2 font-mono">{fmtB(d.est_revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Safe Stock */}
      {safeStock.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-green-500" />
              สต็อกเพียงพอ ({safeStock.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {[...safeStock].sort((a, b) => a.days_until_zero - b.days_until_zero).map((p) => (
                <div key={p.product} className="flex items-center justify-between text-sm px-3 py-2 rounded-md bg-muted/50">
                  <span>{p.product}</span>
                  <span className="text-xs text-muted-foreground">
                    {fmt(p.current_stock)} {p.unit} ({p.days_until_zero > 99 ? "99+" : p.days_until_zero} วัน)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
