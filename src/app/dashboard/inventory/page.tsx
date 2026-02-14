"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type InventoryItem, type StockHistory } from "@/lib/api"
import { useMonitor } from "@/lib/monitor-context"
import { exportCSV } from "@/lib/export"
import {
  Package,
  RefreshCw,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  Download,
} from "lucide-react"

const StockMovementChart = dynamic(() => import("@/components/stock-movement-chart"), { ssr: false })
const StockProductChart = dynamic(() => import("@/components/stock-product-chart"), { ssr: false })

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 1 })
}

function fmtB(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

const CATEGORIES = ["ทั้งหมด", "ผัก", "ผลไม้", "เครื่องปรุง", "ข้าว/แห้ง", "อื่นๆ"] as const

export default function InventoryPage() {
  const { data, loading, refresh: load } = useMonitor()
  const [filter, setFilter] = useState<string>("ทั้งหมด")

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

  const inv = data.inventory
  if (!inv) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">ไม่มีข้อมูลสต็อก — กรุณารัน update_monitor.py ใหม่</p>
        <button onClick={load} className="text-sm underline">ลองใหม่</button>
      </div>
    )
  }

  const sh: StockHistory | undefined = data.stock_history

  const filteredItems = useMemo<InventoryItem[]>(
    () => filter === "ทั้งหมด" ? inv.items : inv.items.filter((i) => i.category === filter),
    [inv.items, filter]
  )

  const lowSet = useMemo(() => new Set(inv.low_stock.map((l) => l.product)), [inv.low_stock])

  const updatedTime = inv.summary.updated
    ? new Date(inv.summary.updated).toLocaleString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        day: "numeric",
        month: "short",
      })
    : "-"

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">สต็อกคงเหลือ</h1>
            <p className="text-sm text-muted-foreground">{data.updated_label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportCSV("inventory", ["สินค้า", "จำนวน", "หน่วย", "ขั้นต่ำ", "หมวดหมู่"],
                inv.items, ["product", "quantity", "unit", "min_stock", "category"])
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
            <span className="text-3xl font-bold">{inv.summary.total_products}</span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ArrowDownToLine className="h-3.5 w-3.5" />
              รับเข้าวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">{fmtB(sh?.today?.total_received)}</span>
            <span className="text-sm text-muted-foreground ml-2">กก.</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ArrowUpFromLine className="h-3.5 w-3.5" />
              ขายวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-orange-500">{fmtB(sh?.today?.total_sold)}</span>
            <span className="text-sm text-muted-foreground ml-2">กก.</span>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${inv.summary.low_count > 0 ? "border-t-red-500" : "border-t-purple-500"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              เหลือน้อย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold ${inv.summary.low_count > 0 ? "text-red-500" : "text-green-500"}`}>
              {inv.summary.low_count}
            </span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      {sh && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Movement Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                รับเข้า-ขายออก 30 วัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockMovementChart data={sh.daily_summary} />
            </CardContent>
          </Card>

          {/* Top Movers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                สินค้าขายดี Top 10
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StockProductChart data={sh.top_movers} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predictions Table */}
      {sh && sh.predictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              พยากรณ์สต็อก — สินค้าที่กำลังจะหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">สินค้า</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">หมวด</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">ขาย/วัน</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">คงเหลือ</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">หมดใน</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">แนะนำ</th>
                  </tr>
                </thead>
                <tbody>
                  {sh.predictions.map((p) => (
                    <tr
                      key={p.product}
                      className={`border-b border-border/50 last:border-0 ${p.suggest_order ? "bg-red-500/5" : ""}`}
                    >
                      <td className="py-2.5 font-medium">{p.product}</td>
                      <td className="py-2.5 text-muted-foreground">{p.category}</td>
                      <td className="py-2.5 text-right font-mono">{fmt(p.avg_daily_sold)} {p.unit}</td>
                      <td className="py-2.5 text-right font-mono">{fmt(p.current_stock)} {p.unit}</td>
                      <td className={`py-2.5 text-right font-mono font-bold ${p.days_until_zero <= 1 ? "text-red-500" : p.days_until_zero <= 3 ? "text-amber-500" : ""}`}>
                        {fmt(p.days_until_zero)} วัน
                      </td>
                      <td className="py-2.5 text-center">
                        {p.suggest_order ? (
                          <Badge variant="destructive" className="text-xs">สั่งเพิ่ม</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">OK</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alert */}
      {inv.low_stock.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              สินค้าเหลือน้อย ({inv.low_stock.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {inv.low_stock.map((item) => (
                <Badge key={item.product} variant="destructive" className="text-xs">
                  {item.product}: {fmt(item.quantity)} {item.unit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              รายการสินค้า ({filteredItems.length})
            </CardTitle>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    filter === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">สินค้า</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">หมวด</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">คงเหลือ</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">ขั้นต่ำ</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isLow = lowSet.has(item.product)
                  return (
                    <tr
                      key={item.product}
                      className={`border-b border-border/50 last:border-0 ${isLow ? "bg-red-500/5" : ""}`}
                    >
                      <td className="py-2.5 font-medium">{item.product}</td>
                      <td className="py-2.5 text-muted-foreground">{item.category}</td>
                      <td className={`py-2.5 text-right font-mono ${isLow ? "text-red-500 font-bold" : ""}`}>
                        {fmt(item.quantity)} {item.unit}
                      </td>
                      <td className="py-2.5 text-right font-mono text-muted-foreground">
                        {fmt(item.min_stock)} {item.unit}
                      </td>
                      <td className="py-2.5 text-center">
                        {isLow ? (
                          <Badge variant="destructive" className="text-xs">LOW</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">OK</Badge>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">ไม่มีข้อมูล</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      {inv.recent_logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Log วันนี้ ({inv.recent_logs.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">เวลา</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">สินค้า</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">ประเภท</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">ก่อน</th>
                    <th className="text-right py-2 pr-6 text-muted-foreground font-medium">หลัง</th>
                    <th className="text-left py-2 pl-6 text-muted-foreground font-medium">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {inv.recent_logs.slice(0, 20).map((log, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2 font-mono text-muted-foreground">{log.time}</td>
                      <td className="py-2 font-medium">{log.product}</td>
                      <td className="py-2 text-center">
                        <Badge variant="outline" className="text-xs">{log.type}</Badge>
                      </td>
                      <td className="py-2 text-right font-mono">{fmt(log.before)}</td>
                      <td className={`py-2 text-right pr-6 font-mono ${log.after < log.before ? "text-red-500" : log.after > log.before ? "text-green-500" : ""}`}>
                        {fmt(log.after)}
                      </td>
                      <td className="py-2 pl-6 text-muted-foreground">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
