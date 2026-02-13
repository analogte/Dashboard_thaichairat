"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type SavingsData } from "@/lib/api"
import { useMonitor } from "@/lib/monitor-context"
import {
  PiggyBank,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CalendarDays,
  Banknote,
  TrendingUp,
} from "lucide-react"

function fmtB(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

function RiskBadge({ risk }: { risk: string }) {
  if (risk === "safe") {
    return (
      <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
        <ShieldCheck className="h-3 w-3 mr-1" />
        SAFE
      </Badge>
    )
  }
  if (risk === "caution") {
    return (
      <Badge className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
        <ShieldAlert className="h-3 w-3 mr-1" />
        CAUTION
      </Badge>
    )
  }
  return (
    <Badge className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
      <ShieldX className="h-3 w-3 mr-1" />
      DANGER
    </Badge>
  )
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full bg-muted rounded-full h-3 mt-2">
      <div className={`h-3 rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

export default function SavingsPage() {
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

  const sav: SavingsData | undefined = data.savings_data
  if (!sav) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">ไม่มีข้อมูลเงินเก็บ</p>
        <button onClick={load} className="text-sm underline">ลองใหม่</button>
      </div>
    )
  }

  // Safety net targets
  const target3d = sav.daily_cost * 3
  const target7d = sav.daily_cost * 7
  const target30d = sav.daily_cost * 30
  const pctOf7d = sav.total > 0 ? Math.round(sav.total / target7d * 100) : 0

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PiggyBank className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">เงินเก็บ / ทุนสำรอง</h1>
            <p className="text-sm text-muted-foreground">{data.updated_label}</p>
          </div>
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={`border-t-4 ${sav.risk === "safe" ? "border-t-green-500" : sav.risk === "caution" ? "border-t-amber-500" : "border-t-red-500"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <PiggyBank className="h-3.5 w-3.5" />
              ยอดเงินเก็บ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold ${sav.risk === "safe" ? "text-green-500" : sav.risk === "caution" ? "text-amber-500" : "text-red-500"}`}>
              {fmtB(sav.total)}
            </span>
            <span className="text-sm text-muted-foreground ml-2">บาท</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              ครอบคลุม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{sav.cover_days}</span>
            <span className="text-sm text-muted-foreground ml-2">วัน</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5" />
              ค่าใช้จ่าย/วัน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-orange-500">{fmtB(sav.daily_cost)}</span>
            <span className="text-sm text-muted-foreground ml-2">บาท</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              บันทึก
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{sav.entries}</span>
            <span className="text-sm text-muted-foreground ml-2">ครั้ง</span>
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Safety Net Analysis
            <RiskBadge risk={sav.risk} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Progress toward 7-day target */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">เป้า 7 วัน ({fmtB(target7d)} บาท)</span>
              <span className="font-mono font-bold">{pctOf7d}%</span>
            </div>
            <ProgressBar
              pct={pctOf7d}
              color={pctOf7d >= 100 ? "bg-green-500" : pctOf7d >= 50 ? "bg-amber-500" : "bg-red-500"}
            />
          </div>

          {/* Milestones */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className={`p-3 rounded-lg border ${sav.total >= target3d ? "border-green-500/30 bg-green-500/5" : "border-border"}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm">Safety 3 วัน</span>
                {sav.total >= target3d ? (
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <ShieldX className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="text-lg font-bold font-mono mt-1">{fmtB(target3d)} บาท</p>
              <p className="text-xs text-muted-foreground">
                {sav.total >= target3d ? "ผ่านแล้ว" : `ขาดอีก ${fmtB(target3d - sav.total)} บาท`}
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${sav.total >= target7d ? "border-green-500/30 bg-green-500/5" : "border-border"}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm">Safety 7 วัน</span>
                {sav.total >= target7d ? (
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                )}
              </div>
              <p className="text-lg font-bold font-mono mt-1">{fmtB(target7d)} บาท</p>
              <p className="text-xs text-muted-foreground">
                {sav.total >= target7d ? "ผ่านแล้ว" : `ขาดอีก ${fmtB(target7d - sav.total)} บาท`}
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${sav.total >= target30d ? "border-green-500/30 bg-green-500/5" : "border-border"}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm">Safety 30 วัน</span>
                {sav.total >= target30d ? (
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <ShieldX className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-lg font-bold font-mono mt-1">{fmtB(target30d)} บาท</p>
              <p className="text-xs text-muted-foreground">
                {sav.total >= target30d ? "ผ่านแล้ว" : `ขาดอีก ${fmtB(target30d - sav.total)} บาท`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings History */}
      {sav.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              ประวัติเงินเก็บ ({sav.history.length} วัน)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">วันที่</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">จำนวน</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">สะสม</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sav.history].reverse().map((h) => (
                    <tr key={h.date} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 font-mono text-muted-foreground">{h.date}</td>
                      <td className="py-2.5 text-right font-mono text-green-500">+{fmtB(h.amount)}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{fmtB(h.cumulative)}</td>
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
