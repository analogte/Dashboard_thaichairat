"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type PnlMonth } from "@/lib/api"
import { useMonitor } from "@/lib/monitor-context"
import { exportCSV } from "@/lib/export"
import { exportSectionPDF } from "@/lib/export-pdf"
import {
  Receipt,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Home,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileText,
} from "lucide-react"

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

function monthLabel(month: string) {
  const [y, m] = month.split("-")
  const months = ["", "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."]
  return `${months[parseInt(m)]} ${y}`
}

function ExpenseBar({ label, amount, total, color, icon: Icon }: {
  label: string
  amount: number
  total: number
  color: string
  icon: typeof DollarSign
}) {
  const pct = total > 0 ? (amount / total) * 100 : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <span className="font-mono font-medium">{fmt(amount)} <span className="text-xs text-muted-foreground">({pct.toFixed(0)}%)</span></span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

export default function PnlPage() {
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

  const pnl = data.pnl_data
  if (!pnl || pnl.months.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Receipt className="h-6 w-6" />
          <h1 className="text-2xl font-bold">กำไรขาดทุน</h1>
        </div>
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <p className="text-muted-foreground">ไม่มีข้อมูล P&L</p>
          <button onClick={load} className="text-sm underline">ลองใหม่</button>
        </div>
      </div>
    )
  }

  const current: PnlMonth = pnl.months[pnl.months.length - 1]
  const prev: PnlMonth | undefined = pnl.months.length > 1 ? pnl.months[pnl.months.length - 2] : undefined

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">กำไรขาดทุน (P&L)</h1>
            <p className="text-sm text-muted-foreground">{monthLabel(current.month)} — {current.days} วัน | {data.updated_label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportCSV("pnl", ["เดือน", "วัน", "รายรับ", "ต้นทุน", "ค่าแรง", "ค่าเช่า", "รายจ่ายรวม", "กำไรสุทธิ", "มาร์จิ้น%"],
                pnl.months, ["month", "days", "income", "cogs", "wages", "rent", "total_expense", "net_profit", "margin_pct"])
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={() => {
              const rows = pnl.months.map(
                (m) => `<tr><td>${monthLabel(m.month)}</td><td class="text-right">${m.days}</td><td class="text-right">${fmt(m.income)}</td><td class="text-right">${fmt(m.total_expense)}</td><td class="text-right ${m.net_profit >= 0 ? "text-green" : "text-red"}">${m.net_profit >= 0 ? "+" : ""}${fmt(m.net_profit)}</td><td class="text-right">${m.margin_pct}%</td></tr>`,
              ).join("")
              exportSectionPDF(
                `งบกำไรขาดทุน (P&L) — ${monthLabel(current.month)}`,
                `<table><thead><tr><th>เดือน</th><th class="text-right">วัน</th><th class="text-right">รายรับ</th><th class="text-right">รายจ่ายรวม</th><th class="text-right">กำไรสุทธิ</th><th class="text-right">Margin</th></tr></thead><tbody>${rows}</tbody></table>`,
              )
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <FileText className="h-3.5 w-3.5" />
            PDF
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
        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              รายรับ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">{fmt(current.income)}</span>
            <span className="text-sm text-muted-foreground ml-2">บาท</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingDown className="h-3.5 w-3.5" />
              รายจ่ายรวม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-red-500">{fmt(current.total_expense)}</span>
            <span className="text-sm text-muted-foreground ml-2">บาท</span>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${current.net_profit >= 0 ? "border-t-emerald-500" : "border-t-rose-500"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              กำไรสุทธิ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold ${current.net_profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {current.net_profit >= 0 ? "+" : ""}{fmt(current.net_profit)}
            </span>
            <span className="text-sm text-muted-foreground ml-2">บาท</span>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${current.margin_pct >= 30 ? "border-t-blue-500" : "border-t-amber-500"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              มาร์จิ้นสุทธิ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold font-mono ${current.margin_pct >= 30 ? "text-blue-500" : "text-amber-500"}`}>
              {current.margin_pct}%
            </span>
            {pnl.change_pct != null && (
              <div className="flex items-center gap-1 mt-1">
                {pnl.change_pct >= 0 ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className={`text-xs font-mono ${pnl.change_pct >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {pnl.change_pct >= 0 ? "+" : ""}{pnl.change_pct}% จากเดือนก่อน
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* P&L Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              งบกำไรขาดทุน — {monthLabel(current.month)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Revenue */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="font-medium text-green-500">รายรับ</span>
                <span className="font-mono font-bold text-green-500">{fmt(current.income)}</span>
              </div>

              {/* COGS */}
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="text-muted-foreground pl-4">ต้นทุนสินค้า</span>
                <span className="font-mono text-red-500">-{fmt(current.cogs)}</span>
              </div>

              {/* Gross Profit */}
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="font-medium">กำไรขั้นต้น</span>
                <span className={`font-mono font-bold ${current.gross_profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {fmt(current.gross_profit)}
                </span>
              </div>

              {/* Operating Expenses */}
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="text-muted-foreground pl-4">ค่าแรงพนักงาน</span>
                <span className="font-mono text-red-500">-{fmt(current.wages)}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-sm">
                <span className="text-muted-foreground pl-4">ค่าเช่า</span>
                <span className="font-mono text-red-500">-{fmt(current.rent)}</span>
              </div>

              {/* Net Profit */}
              <div className="flex items-center justify-between py-3 border-t-2 border-border">
                <span className="font-bold text-lg">กำไรสุทธิ</span>
                <span className={`font-mono font-bold text-lg ${current.net_profit >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                  {current.net_profit >= 0 ? "+" : ""}{fmt(current.net_profit)}
                </span>
              </div>

              {/* Average per day */}
              <div className="flex items-center justify-between py-1 text-sm bg-muted/30 px-3 rounded-lg">
                <span className="text-muted-foreground">เฉลี่ยกำไร/วัน</span>
                <span className="font-mono font-medium">
                  {current.days > 0 ? fmt(Math.round(current.net_profit / current.days)) : 0} บาท
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              สัดส่วนค่าใช้จ่าย
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ExpenseBar
              label="ต้นทุนสินค้า"
              amount={current.cogs}
              total={current.total_expense}
              color="bg-red-500"
              icon={ShoppingCart}
            />
            <ExpenseBar
              label="ค่าแรงพนักงาน"
              amount={current.wages}
              total={current.total_expense}
              color="bg-purple-500"
              icon={Users}
            />
            <ExpenseBar
              label="ค่าเช่า"
              amount={current.rent}
              total={current.total_expense}
              color="bg-amber-500"
              icon={Home}
            />

            {/* Summary */}
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ค่าใช้จ่ายรวม</span>
                <span className="font-mono font-bold">{fmt(current.total_expense)} บาท</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Gross Margin</span>
                <span className="font-mono font-medium">
                  {current.income > 0 ? (current.gross_profit / current.income * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Net Margin</span>
                <span className="font-mono font-medium">{current.margin_pct}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Branch Breakdown */}
      {current.branches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              แยกตามสาขา — {monthLabel(current.month)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">สาขา</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">รายรับ</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">ต้นทุน</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">กำไรขั้นต้น</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">สัดส่วน</th>
                  </tr>
                </thead>
                <tbody>
                  {current.branches.map((b) => {
                    const brProfit = b.income - b.expense
                    const pctOfIncome = current.income > 0 ? (b.income / current.income * 100) : 0
                    return (
                      <tr key={b.branch} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 font-medium">{b.branch}</td>
                        <td className="py-2.5 text-right font-mono text-green-500">{fmt(b.income)}</td>
                        <td className="py-2.5 text-right font-mono text-red-500">{fmt(b.expense)}</td>
                        <td className={`py-2.5 text-right font-mono font-bold ${brProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {brProfit >= 0 ? "+" : ""}{fmt(brProfit)}
                        </td>
                        <td className="py-2.5 text-right">
                          <Badge variant="outline" className="text-xs font-mono">{pctOfIncome.toFixed(0)}%</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border font-bold">
                    <td className="py-3">รวม</td>
                    <td className="py-3 text-right font-mono text-green-500">{fmt(current.income)}</td>
                    <td className="py-3 text-right font-mono text-red-500">{fmt(current.cogs)}</td>
                    <td className={`py-3 text-right font-mono ${current.gross_profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {current.gross_profit >= 0 ? "+" : ""}{fmt(current.gross_profit)}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant="outline" className="text-xs font-mono">100%</Badge>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Comparison Table */}
      {pnl.months.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              เปรียบเทียบรายเดือน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">เดือน</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">วัน</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">รายรับ</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">รายจ่าย</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">กำไรสุทธิ</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {[...pnl.months].reverse().map((m) => (
                    <tr key={m.month} className={`border-b border-border/50 last:border-0 ${m.month === current.month ? "bg-muted/30" : ""}`}>
                      <td className="py-2.5 font-medium">
                        {monthLabel(m.month)}
                        {m.month === current.month && <Badge variant="secondary" className="text-xs ml-2">ปัจจุบัน</Badge>}
                      </td>
                      <td className="py-2.5 text-right font-mono text-muted-foreground">{m.days}</td>
                      <td className="py-2.5 text-right font-mono text-green-500">{fmt(m.income)}</td>
                      <td className="py-2.5 text-right font-mono text-red-500">{fmt(m.total_expense)}</td>
                      <td className={`py-2.5 text-right font-mono font-bold ${m.net_profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {m.net_profit >= 0 ? "+" : ""}{fmt(m.net_profit)}
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge
                          variant={m.margin_pct >= 30 ? "default" : m.margin_pct >= 0 ? "secondary" : "destructive"}
                          className="text-xs font-mono"
                        >
                          {m.margin_pct}%
                        </Badge>
                      </td>
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
