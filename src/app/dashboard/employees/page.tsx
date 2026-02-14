"use client"

import { useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type EmployeeStats } from "@/lib/api"
import { useMonitor } from "@/lib/monitor-context"
import { exportCSV } from "@/lib/export"
import {
  Users,
  RefreshCw,
  UserCheck,
  Wallet,
  PieChart,
  Briefcase,
  CalendarDays,
  Download,
} from "lucide-react"

const AttendanceChart = dynamic(() => import("@/components/attendance-chart"), { ssr: false })
const WageChart = dynamic(() => import("@/components/wage-chart"), { ssr: false })

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 1 })
}

function fmtB(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 0 })
}

export default function EmployeesPage() {
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

  const es: EmployeeStats | undefined = data.employee_stats
  if (!es) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">ไม่มีข้อมูลพนักงาน — กรุณารัน update_monitor.py ใหม่</p>
        <button onClick={load} className="text-sm underline">ลองใหม่</button>
      </div>
    )
  }

  const ms = es.monthly_summary
  const employees = data.shop_history?.employees ?? []

  const empTotals = useMemo(() => {
    let worked = 0, leave = 0, absent = 0
    for (const e of es.employee_monthly) {
      worked += e.days_worked
      leave += e.days_leave
      absent += e.days_absent
    }
    return { worked, leave, absent }
  }, [es.employee_monthly])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">พนักงาน</h1>
            <p className="text-sm text-muted-foreground">{es.month_label} | {data.updated_label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const em = es.employee_monthly ?? []
              exportCSV("employees", ["ชื่อ", "ประเภท", "ค่าแรง/วัน", "วันทำงาน", "ลา", "ขาด", "ค่าแรงรวม", "อัตราเข้างาน%"],
                em, ["name", "type", "wage_rate", "days_worked", "days_leave", "days_absent", "total_wage_paid", "attendance_rate"])
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
              <Users className="h-3.5 w-3.5" />
              พนักงานทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{es.total_employees}</span>
            <span className="text-sm text-muted-foreground ml-2">คน</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5" />
              มาวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">{es.active_today}</span>
            <span className="text-sm text-muted-foreground ml-2">คน</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5" />
              ค่าแรงวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-purple-500">{fmtB(es.today_wages)}</span>
            <span className="text-sm text-muted-foreground ml-2">บาท</span>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${ms.budget_used_pct > 80 ? "border-t-red-500" : "border-t-orange-500"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5" />
              งบใช้ไป
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold ${ms.budget_used_pct > 80 ? "text-red-500" : "text-orange-500"}`}>
              {fmt(ms.budget_used_pct)}%
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              {fmtB(ms.total_wages_paid)} / {fmtB(es.budget)} บาท (เหลือ {fmtB(ms.budget_remaining)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      {es.daily_trend.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                จำนวนมาทำงาน 30 วัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceChart data={es.daily_trend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                ค่าแรงรายวัน 30 วัน
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WageChart data={es.daily_trend} budget={es.budget} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Summary Table */}
      {es.employee_monthly.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              สรุปรายเดือน — {es.month_label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">ชื่อ</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">ประเภท</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">ค่าแรง/วัน</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">มา</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">ลา</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">ขาด</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">ค่าแรงรวม</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">อัตรามา</th>
                  </tr>
                </thead>
                <tbody>
                  {es.employee_monthly.map((em) => (
                    <tr key={em.name} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 font-medium">{em.name}</td>
                      <td className="py-2.5 text-muted-foreground">{em.type}</td>
                      <td className="py-2.5 text-right font-mono">{fmtB(em.wage_rate)}</td>
                      <td className="py-2.5 text-right font-mono text-green-500">{em.days_worked}</td>
                      <td className="py-2.5 text-right font-mono text-amber-500">{em.days_leave || "-"}</td>
                      <td className="py-2.5 text-right font-mono text-red-500">{em.days_absent || "-"}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{fmtB(em.total_wage_paid)}</td>
                      <td className="py-2.5 text-right">
                        <Badge
                          variant={em.attendance_rate >= 90 ? "secondary" : "destructive"}
                          className="text-xs font-mono"
                        >
                          {fmt(em.attendance_rate)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="border-t-2 border-border font-bold">
                    <td className="py-2.5" colSpan={3}>รวม</td>
                    <td className="py-2.5 text-right font-mono text-green-500">
                      {empTotals.worked}
                    </td>
                    <td className="py-2.5 text-right font-mono text-amber-500">
                      {empTotals.leave || "-"}
                    </td>
                    <td className="py-2.5 text-right font-mono text-red-500">
                      {empTotals.absent || "-"}
                    </td>
                    <td className="py-2.5 text-right font-mono">{fmtB(ms.total_wages_paid)}</td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today Attendance Table */}
      {es.today_attendance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              สถานะวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">ชื่อ</th>
                    <th className="text-center py-2 text-muted-foreground font-medium">สถานะ</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">ค่าแรง</th>
                  </tr>
                </thead>
                <tbody>
                  {es.today_attendance.map((a) => (
                    <tr key={a.name} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 font-medium">{a.name}</td>
                      <td className="py-2.5 text-center">
                        <Badge
                          variant={a.status === "มา" ? "secondary" : "destructive"}
                          className={`text-xs ${a.status === "มา" ? "bg-green-500/10 text-green-500" : a.status === "ลา" ? "bg-amber-500/10 text-amber-500" : ""}`}
                        >
                          {a.status}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {a.wage > 0 ? `${fmtB(a.wage)} บาท` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee List Table */}
      {employees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              รายชื่อพนักงาน ({employees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">ชื่อ</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">ประเภท</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">กะ</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">ค่าแรง/วัน</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.name} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 font-medium">{emp.name}</td>
                      <td className="py-2.5 text-muted-foreground">{emp.type}</td>
                      <td className="py-2.5 text-muted-foreground">{emp.shift || "-"}</td>
                      <td className="py-2.5 text-right font-mono">{fmtB(emp.wage)} บาท</td>
                      <td className="py-2.5 text-muted-foreground">{emp.notes || "-"}</td>
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
