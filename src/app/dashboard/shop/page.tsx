"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitor } from "@/lib/monitor-context"
import { exportCSV } from "@/lib/export"
import {
  Store,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  CalendarDays,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react"

const DailyChart = dynamic(() => import("@/components/daily-chart"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">
      กำลังโหลดกราฟ...
    </div>
  ),
})

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

function pct(n: number) {
  if (n === 0) return "0%"
  return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`
}

export default function ShopPage() {
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

  const shop = data.shop
  const h = data.shop_history
  const week = h?.week
  const month = h?.month

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">ภาพรวมร้านค้า</h1>
            <p className="text-sm text-muted-foreground">{data.updated_label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const daily = h?.daily ?? []
              exportCSV("shop-daily", ["วันที่", "รายรับ", "รายจ่าย", "กำไร"], daily, ["date", "income", "expense", "profit"])
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

      {/* Period KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Today */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              วันนี้ ({shop.date})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">รายรับ</span>
              <span className="text-lg font-bold text-green-500">{fmt(shop.income)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">รายจ่าย</span>
              <span className="text-lg font-bold text-red-500">{fmt(shop.expense)}</span>
            </div>
            <div className="border-t border-border pt-2 flex items-baseline justify-between">
              <span className="text-xs font-medium">กำไร</span>
              <span className={`text-xl font-bold ${shop.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                {shop.profit >= 0 ? "+" : ""}{fmt(shop.profit)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              สัปดาห์นี้ ({week?.days || 0} วัน)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">รายรับ</span>
              <span className="text-lg font-bold text-green-500">{fmt(week?.income)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">รายจ่าย</span>
              <span className="text-lg font-bold text-red-500">{fmt(week?.expense)}</span>
            </div>
            <div className="border-t border-border pt-2 flex items-center justify-between">
              <span className="text-xs font-medium">เทียบสัปดาห์ก่อน</span>
              {week?.change_pct != null && (
                <div className="flex items-center gap-1">
                  {week.change_pct >= 0 ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span className={`text-sm font-bold ${week.change_pct >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {pct(week.change_pct)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              เดือนนี้ ({month?.days || 0} วัน)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">รายรับ</span>
              <span className="text-lg font-bold text-green-500">{fmt(month?.income)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">รายจ่าย</span>
              <span className="text-lg font-bold text-red-500">{fmt(month?.expense)}</span>
            </div>
            <div className="border-t border-border pt-2 flex items-baseline justify-between">
              <span className="text-xs font-medium">กำไรสุทธิ</span>
              <span className={`text-xl font-bold ${(month?.profit ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                {(month?.profit ?? 0) >= 0 ? "+" : ""}{fmt(month?.profit)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            รายรับ-รายจ่าย รายวัน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DailyChart data={h?.daily || []} />
        </CardContent>
      </Card>

      {/* Monthly Branch Summary */}
      {h?.branch_monthly && h.branch_monthly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4" />
              สรุปรายสาขาทั้งเดือน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">สาขา</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">รายรับ</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">รายจ่าย</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">กำไร</th>
                  </tr>
                </thead>
                <tbody>
                  {h.branch_monthly.map((b) => (
                    <tr key={b.branch} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5">
                        <span className="font-medium">{b.branch}</span>
                        {b.income === 0 && b.expense > 0 && <span className="text-xs text-muted-foreground ml-1">(ค่าสินค้า)</span>}
                      </td>
                      <td className="py-2.5 text-right font-mono text-green-500">{fmt(b.income)}</td>
                      <td className="py-2.5 text-right font-mono text-red-500">{fmt(b.expense)}</td>
                      <td className={`py-2.5 text-right font-mono font-bold ${b.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {b.profit >= 0 ? "+" : ""}{fmt(b.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-bold">
                    <td className="py-2.5">รวม</td>
                    <td className="py-2.5 text-right font-mono text-green-500">{fmt(month?.income)}</td>
                    <td className="py-2.5 text-right font-mono text-red-500">{fmt(month?.expense)}</td>
                    <td className={`py-2.5 text-right font-mono ${(month?.profit ?? 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {(month?.profit ?? 0) >= 0 ? "+" : ""}{fmt(month?.profit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Branch Table + Employees */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Branch Table */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">แยกตามสาขา วันล่าสุด ({shop.date})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">สาขา</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">รายรับ</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">รายจ่าย</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">กำไร</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">มาร์จิ้น</th>
                  </tr>
                </thead>
                <tbody>
                  {shop.branches.length > 0 ? (
                    shop.branches.map((b) => {
                      const isCost = b.income === 0 && b.expense > 0
                      const margin = b.income > 0 ? ((b.profit / b.income) * 100) : 0
                      return (
                        <tr key={b.name} className="border-b border-border/50 last:border-0">
                          <td className="py-2.5">
                            <span className="font-medium">{b.name}</span>
                            {isCost && <span className="text-xs text-muted-foreground ml-1">(ค่าสินค้า)</span>}
                          </td>
                          <td className="py-2.5 text-right font-mono text-green-500">{fmt(b.income)}</td>
                          <td className="py-2.5 text-right font-mono text-red-500">{fmt(b.expense)}</td>
                          <td className={`py-2.5 text-right font-mono font-bold ${b.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {b.profit >= 0 ? "+" : ""}{fmt(b.profit)}
                          </td>
                          <td className="py-2.5 text-right">
                            <Badge variant={margin > 0 ? "default" : "secondary"} className="text-xs font-mono">
                              {margin > 0 ? `${margin.toFixed(0)}%` : "-"}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-muted-foreground">ไม่มีข้อมูล</td>
                    </tr>
                  )}
                </tbody>
                {shop.branches.length > 0 && (
                  <tfoot>
                    <tr className="border-t-2 border-border font-bold">
                      <td className="py-2.5">รวม</td>
                      <td className="py-2.5 text-right font-mono text-green-500">{fmt(shop.income)}</td>
                      <td className="py-2.5 text-right font-mono text-red-500">{fmt(shop.expense)}</td>
                      <td className={`py-2.5 text-right font-mono ${shop.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {shop.profit >= 0 ? "+" : ""}{fmt(shop.profit)}
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge variant="outline" className="text-xs font-mono">
                          {shop.income > 0 ? `${((shop.profit / shop.income) * 100).toFixed(0)}%` : "-"}
                        </Badge>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Employees & Attendance */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              พนักงาน ({h?.attendance_date || shop.date})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {(h?.attendance || []).map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{fmt(a.wage)}</span>
                    <Badge
                      variant={a.status === "present" ? "default" : a.status === "late" ? "secondary" : "destructive"}
                      className="text-xs"
                    >
                      {a.status === "present" ? "OK" : a.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!h?.attendance || h.attendance.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีข้อมูลการเข้างาน</p>
              )}
            </div>
            {h?.attendance && h.attendance.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{h.attendance.length} คน</span>
                <span className="text-sm font-bold font-mono">
                  {fmt(h.attendance.reduce((sum, a) => sum + a.wage, 0))} บาท
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
