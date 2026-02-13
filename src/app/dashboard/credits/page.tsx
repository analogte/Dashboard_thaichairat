"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type CreditsData } from "@/lib/api"
import { useMonitor } from "@/lib/monitor-context"
import {
  HandCoins,
  RefreshCw,
  Users,
  Banknote,
  CheckCircle2,
} from "lucide-react"

function fmtB(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

export default function CreditsPage() {
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

  const cred: CreditsData | undefined = data.credits_data
  if (!cred || cred.customers.length === 0) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <HandCoins className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">ลูกหนี้การค้า</h1>
            <p className="text-sm text-muted-foreground">{data.updated_label}</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-48 gap-3">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
          <p className="text-muted-foreground">ไม่มีลูกหนี้ค้างชำระ</p>
          <button onClick={load} className="text-sm underline">รีเฟรช</button>
        </div>
      </div>
    )
  }

  const totalCredit = cred.customers.reduce((s, x) => s + x.total_credit, 0)
  const totalPaid = cred.customers.reduce((s, x) => s + x.total_paid, 0)

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HandCoins className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">ลูกหนี้การค้า</h1>
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              จำนวนลูกหนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{cred.count}</span>
            <span className="text-sm text-muted-foreground ml-2">ราย</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5" />
              ยอดเชื่อคงเหลือ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-amber-500">{fmtB(cred.total_outstanding)}</span>
            <span className="text-sm text-muted-foreground ml-2">บาท</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              เก็บได้แล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">{fmtB(totalPaid)}</span>
            <span className="text-sm text-muted-foreground ml-2">บาท</span>
            {totalCredit > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                ({Math.round(totalPaid / totalCredit * 100)}%)
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Credits Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <HandCoins className="h-4 w-4" />
            รายการลูกหนี้ ({cred.customers.length} ราย)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">ลูกค้า</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">ยอดเชื่อ</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">จ่ายแล้ว</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">คงเหลือ</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {cred.customers
                  .sort((a, b) => b.balance - a.balance)
                  .map((c, i) => (
                    <tr
                      key={c.customer}
                      className={`border-b border-border/50 last:border-0 ${c.balance > 0 ? "" : "opacity-60"}`}
                    >
                      <td className="py-2.5 text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 font-medium">{c.customer}</td>
                      <td className="py-2.5 text-right font-mono">{fmtB(c.total_credit)}</td>
                      <td className="py-2.5 text-right font-mono text-green-500">{fmtB(c.total_paid)}</td>
                      <td className={`py-2.5 text-right font-mono font-bold ${c.balance > 0 ? "text-amber-500" : "text-green-500"}`}>
                        {fmtB(c.balance)}
                      </td>
                      <td className="py-2.5 text-center">
                        {c.balance <= 0 ? (
                          <Badge variant="secondary" className="text-xs">หมดหนี้</Badge>
                        ) : c.balance >= 5000 ? (
                          <Badge variant="destructive" className="text-xs">ค้างมาก</Badge>
                        ) : c.balance >= 2000 ? (
                          <Badge className="text-xs bg-amber-500 hover:bg-amber-600">ค้างปานกลาง</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">ค้างน้อย</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-3" colSpan={2}>รวมทั้งหมด</td>
                  <td className="py-3 text-right font-mono">{fmtB(totalCredit)}</td>
                  <td className="py-3 text-right font-mono text-green-500">{fmtB(totalPaid)}</td>
                  <td className="py-3 text-right font-mono text-amber-500">{fmtB(cred.total_outstanding)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
