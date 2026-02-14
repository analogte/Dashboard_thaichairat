"use client"

import dynamic from "next/dynamic"
import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitor } from "@/lib/monitor-context"
import {
  GitCompareArrows,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Trophy,
  BarChart3,
  Percent,
  ArrowUpDown,
} from "lucide-react"

const BranchComparisonChart = dynamic(
  () => import("@/components/branch-comparison-chart"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
        กำลังโหลดกราฟ...
      </div>
    ),
  },
)

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

export default function ComparePage() {
  const { data, loading, refresh } = useMonitor()

  const branches = useMemo(() => {
    if (!data?.shop?.branches) return []
    return data.shop.branches.map((b) => ({
      ...b,
      margin: b.income > 0 ? (b.profit / b.income) * 100 : 0,
      share: 0,
    }))
  }, [data])

  const totals = useMemo(() => {
    const income = branches.reduce((s, b) => s + b.income, 0)
    const expense = branches.reduce((s, b) => s + b.expense, 0)
    const profit = branches.reduce((s, b) => s + b.profit, 0)
    const margin = income > 0 ? (profit / income) * 100 : 0
    return { income, expense, profit, margin }
  }, [branches])

  const ranked = useMemo(() => {
    return branches
      .map((b) => ({
        ...b,
        share: totals.income > 0 ? (b.income / totals.income) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit)
  }, [branches, totals])

  // Monthly branch data
  const monthlyBranches = useMemo(() => {
    if (!data?.shop_history?.branch_monthly) return []
    return data.shop_history.branch_monthly.map((b) => ({
      name: b.branch,
      income: b.income,
      expense: b.expense,
      profit: b.profit,
      margin: b.income > 0 ? (b.profit / b.income) * 100 : 0,
    }))
  }, [data])

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
        <button onClick={refresh} className="text-sm underline">ลองใหม่</button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitCompareArrows className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">เปรียบเทียบสาขา</h1>
            <p className="text-sm text-muted-foreground">
              เทียบผลประกอบการระหว่างสาขา | {data.shop.date}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="border-t-4 border-t-green-500">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">รวมรายรับ</span>
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            </div>
            <div className="text-xl font-bold">{fmt(totals.income)}</div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-red-500">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">รวมรายจ่าย</span>
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            </div>
            <div className="text-xl font-bold">{fmt(totals.expense)}</div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">รวมกำไร</span>
              <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className={`text-xl font-bold ${totals.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
              {totals.profit >= 0 ? "+" : ""}{fmt(totals.profit)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-amber-500">
          <CardContent className="pt-4 pb-3 px-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">มาร์จิ้นเฉลี่ย</span>
              <Percent className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold">{totals.margin.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Ranking */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              เปรียบเทียบวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            {branches.length > 0 ? (
              <BranchComparisonChart branches={branches} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">ไม่มีข้อมูลสาขา</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              อันดับสาขา (กำไร)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ranked.map((b, i) => (
                <div key={b.name} className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${
                      i === 0
                        ? "bg-amber-500/20 text-amber-500"
                        : i === 1
                        ? "bg-slate-400/20 text-slate-400"
                        : i === 2
                        ? "bg-orange-600/20 text-orange-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{b.name}</span>
                      <span className={`text-sm font-mono ${b.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {b.profit >= 0 ? "+" : ""}{fmt(b.profit)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-muted-foreground">
                        รายรับ {fmt(b.income)} | มาร์จิ้น {b.margin.toFixed(1)}%
                      </span>
                      <Badge variant="outline" className="text-xs">{b.share.toFixed(1)}%</Badge>
                    </div>
                    {/* Share bar */}
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          i === 0 ? "bg-amber-500" : i === 1 ? "bg-slate-400" : "bg-blue-500"
                        }`}
                        style={{ width: `${Math.min(b.share, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {ranked.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">ไม่มีข้อมูล</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            ตารางเปรียบเทียบรายละเอียด
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">สาขา</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">รายรับ</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">รายจ่าย</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">กำไร</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">มาร์จิ้น</th>
                  <th className="text-right py-2 px-3 font-medium text-muted-foreground">สัดส่วน</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((b) => (
                  <tr key={b.name} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="py-2.5 px-3 font-medium">{b.name}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{fmt(b.income)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{fmt(b.expense)}</td>
                    <td className={`py-2.5 px-3 text-right font-mono font-medium ${b.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {b.profit >= 0 ? "+" : ""}{fmt(b.profit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{b.margin.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right font-mono">{b.share.toFixed(1)}%</td>
                  </tr>
                ))}
                {/* Totals row */}
                {ranked.length > 0 && (
                  <tr className="bg-muted/30 font-medium">
                    <td className="py-2.5 px-3">รวมทั้งหมด</td>
                    <td className="py-2.5 px-3 text-right font-mono">{fmt(totals.income)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{fmt(totals.expense)}</td>
                    <td className={`py-2.5 px-3 text-right font-mono ${totals.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {totals.profit >= 0 ? "+" : ""}{fmt(totals.profit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{totals.margin.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right font-mono">100%</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Branch Summary */}
      {monthlyBranches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">สรุปรายเดือน (ตามสาขา)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" role="table">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">สาขา</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">รายรับ</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">รายจ่าย</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">กำไร</th>
                    <th className="text-right py-2 px-3 font-medium text-muted-foreground">มาร์จิ้น</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBranches.map((b) => (
                    <tr key={b.name} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="py-2.5 px-3 font-medium">{b.name}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{fmt(b.income)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{fmt(b.expense)}</td>
                      <td className={`py-2.5 px-3 text-right font-mono font-medium ${b.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {b.profit >= 0 ? "+" : ""}{fmt(b.profit)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{b.margin.toFixed(1)}%</td>
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
