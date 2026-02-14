"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type PayablesData } from "@/lib/api"
import { useMonitor } from "@/lib/monitor-context"
import { exportCSV } from "@/lib/export"
import {
  CreditCard,
  RefreshCw,
  Users,
  Banknote,
  CheckCircle2,
  Download,
} from "lucide-react"

function fmtB(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

export default function PayablesPage() {
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

  const pay: PayablesData | undefined = data.payables_data
  if (!pay || pay.suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">ไม่มีข้อมูลหนี้ค้างชำระ</p>
        <button onClick={load} className="text-sm underline">ลองใหม่</button>
      </div>
    )
  }

  const { totalDebt, totalPaid, sortedSuppliers } = useMemo(() => {
    let debt = 0, paid = 0
    for (const s of pay.suppliers) {
      debt += s.total_debt
      paid += s.total_paid
    }
    const sorted = [...pay.suppliers].sort((a, b) => b.balance - a.balance)
    return { totalDebt: debt, totalPaid: paid, sortedSuppliers: sorted }
  }, [pay.suppliers])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">หนี้ค้างชำระ</h1>
            <p className="text-sm text-muted-foreground">{data.updated_label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportCSV("payables", ["Supplier", "ยอดหนี้", "ชำระแล้ว", "คงเหลือ"],
                pay.suppliers, ["supplier", "total_debt", "total_paid", "balance"])
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
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              จำนวน Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{pay.count}</span>
            <span className="text-sm text-muted-foreground ml-2">ราย</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Banknote className="h-3.5 w-3.5" />
              ยอดหนี้คงเหลือ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-red-500">{fmtB(pay.total_outstanding)}</span>
            <span className="text-sm text-muted-foreground ml-2">บาท</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              ชำระแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">{fmtB(totalPaid)}</span>
            <span className="text-sm text-muted-foreground ml-2">บาท</span>
            {totalDebt > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                ({Math.round(totalPaid / totalDebt * 100)}%)
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payables Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            รายการหนี้ Supplier ({pay.suppliers.length} ราย)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Supplier</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">ยอดหนี้</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">ชำระแล้ว</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">คงเหลือ</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {sortedSuppliers.map((s, i) => (
                    <tr
                      key={s.supplier}
                      className={`border-b border-border/50 last:border-0 ${s.balance > 0 ? "" : "opacity-60"}`}
                    >
                      <td className="py-2.5 text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 font-medium">{s.supplier}</td>
                      <td className="py-2.5 text-right font-mono">{fmtB(s.total_debt)}</td>
                      <td className="py-2.5 text-right font-mono text-green-500">{fmtB(s.total_paid)}</td>
                      <td className={`py-2.5 text-right font-mono font-bold ${s.balance > 0 ? "text-red-500" : "text-green-500"}`}>
                        {fmtB(s.balance)}
                      </td>
                      <td className="py-2.5 text-center">
                        {s.balance <= 0 ? (
                          <Badge variant="secondary" className="text-xs">หมดหนี้</Badge>
                        ) : s.balance >= 20000 ? (
                          <Badge variant="destructive" className="text-xs">สูง</Badge>
                        ) : s.balance >= 10000 ? (
                          <Badge className="text-xs bg-amber-500 hover:bg-amber-600">ปานกลาง</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">ปกติ</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border font-bold">
                  <td className="py-3" colSpan={2}>รวมทั้งหมด</td>
                  <td className="py-3 text-right font-mono">{fmtB(totalDebt)}</td>
                  <td className="py-3 text-right font-mono text-green-500">{fmtB(totalPaid)}</td>
                  <td className="py-3 text-right font-mono text-red-500">{fmtB(pay.total_outstanding)}</td>
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
