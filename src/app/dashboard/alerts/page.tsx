"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitor } from "@/lib/monitor-context"
import {
  Bell,
  RefreshCw,
  AlertTriangle,
  Package,
  CreditCard,
  HandCoins,
  ShoppingBasket,
  Users,
  PiggyBank,
  Server,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
} from "lucide-react"

type Severity = "danger" | "warning" | "info"
type Category = "stock" | "payable" | "credit" | "market" | "wage" | "savings" | "system"

interface Alert {
  severity: Severity
  category: Category
  title: string
  detail: string
}

const CATEGORY_META: Record<Category, { label: string; icon: typeof Bell; color: string }> = {
  stock: { label: "สต็อก", icon: Package, color: "text-orange-500" },
  payable: { label: "หนี้ supplier", icon: CreditCard, color: "text-red-500" },
  credit: { label: "ลูกหนี้", icon: HandCoins, color: "text-amber-500" },
  market: { label: "ราคาตลาด", icon: ShoppingBasket, color: "text-green-500" },
  wage: { label: "ค่าแรง", icon: Users, color: "text-purple-500" },
  savings: { label: "เงินเก็บ", icon: PiggyBank, color: "text-blue-500" },
  system: { label: "ระบบ", icon: Server, color: "text-cyan-500" },
}

function SeverityBadge({ severity }: { severity: Severity }) {
  if (severity === "danger") {
    return (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        วิกฤต
      </Badge>
    )
  }
  if (severity === "warning") {
    return (
      <Badge className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/20">
        <ShieldAlert className="h-3 w-3 mr-1" />
        เตือน
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-xs">
      แจ้งเตือน
    </Badge>
  )
}

export default function AlertsPage() {
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

  // Collect all alerts (memoized)
  const { alerts, dangerCount, warningCount, categories } = useMemo(() => {
    const list: Alert[] = []

    if (data.inventory?.low_stock) {
      for (const item of data.inventory.low_stock) {
        list.push({ severity: "danger", category: "stock", title: `${item.product} เหลือน้อย`, detail: `คงเหลือ ${item.quantity} ${item.unit} (ขั้นต่ำ ${item.min_stock})` })
      }
    }
    if (data.stock_history?.predictions) {
      for (const p of data.stock_history.predictions) {
        if (p.suggest_order) {
          list.push({ severity: p.days_until_zero <= 1 ? "danger" : "warning", category: "stock", title: `${p.product} จะหมดใน ${p.days_until_zero.toFixed(0)} วัน`, detail: `คงเหลือ ${p.current_stock.toFixed(1)} ${p.unit} | ขายเฉลี่ย ${p.avg_daily_sold.toFixed(1)} ${p.unit}/วัน` })
        }
      }
    }
    if (data.payables_data?.suppliers) {
      for (const s of data.payables_data.suppliers) {
        if (s.balance >= 20000) list.push({ severity: "danger", category: "payable", title: `${s.supplier} — หนี้ค้างสูง`, detail: `คงเหลือ ${s.balance.toLocaleString()} บาท` })
        else if (s.balance >= 10000) list.push({ severity: "warning", category: "payable", title: `${s.supplier} — หนี้ค้างปานกลาง`, detail: `คงเหลือ ${s.balance.toLocaleString()} บาท` })
      }
    }
    if (data.credits_data?.customers) {
      for (const c of data.credits_data.customers) {
        if (c.balance >= 5000) list.push({ severity: "danger", category: "credit", title: `${c.customer} — ค้างเชื่อมาก`, detail: `คงเหลือ ${c.balance.toLocaleString()} บาท` })
        else if (c.balance >= 2000) list.push({ severity: "warning", category: "credit", title: `${c.customer} — ค้างเชื่อปานกลาง`, detail: `คงเหลือ ${c.balance.toLocaleString()} บาท` })
      }
    }
    if (data.market_stats?.alerts) {
      for (const a of data.market_stats.alerts) {
        list.push({ severity: Math.abs(a.change_pct) >= 20 ? "danger" : "warning", category: "market", title: `${a.name} ราคา${a.direction === "up" ? "ขึ้น" : "ลง"} ${Math.abs(a.change_pct).toFixed(1)}%`, detail: a.direction === "up" ? `${a.prev_min}-${a.prev_max} → ${a.dit_min}-${a.dit_max} (แพงขึ้น)` : `${a.prev_min}-${a.prev_max} → ${a.dit_min}-${a.dit_max} (ถูกลง)` })
      }
    }
    if (data.employee_stats?.monthly_summary) {
      const pct = data.employee_stats.monthly_summary.budget_used_pct
      if (pct > 90) list.push({ severity: "danger", category: "wage", title: `ค่าแรงใช้ไป ${pct.toFixed(0)}% ของงบ`, detail: `จ่ายแล้ว ${data.employee_stats.monthly_summary.total_wages_paid.toLocaleString()} / ${data.employee_stats.budget.toLocaleString()} บาท — เหลือ ${data.employee_stats.monthly_summary.budget_remaining.toLocaleString()}` })
      else if (pct > 70) list.push({ severity: "warning", category: "wage", title: `ค่าแรงใช้ไป ${pct.toFixed(0)}% ของงบ`, detail: `เหลืองบ ${data.employee_stats.monthly_summary.budget_remaining.toLocaleString()} บาท` })
    }
    if (data.savings_data) {
      if (data.savings_data.risk === "danger") list.push({ severity: "danger", category: "savings", title: "เงินเก็บอยู่ในระดับอันตราย", detail: `${data.savings_data.total.toLocaleString()} บาท — ครอบคลุมแค่ ${data.savings_data.cover_days} วัน` })
      else if (data.savings_data.risk === "caution") list.push({ severity: "warning", category: "savings", title: "เงินเก็บอยู่ในระดับระวัง", detail: `${data.savings_data.total.toLocaleString()} บาท — ครอบคลุม ${data.savings_data.cover_days} วัน` })
    }
    if (data.system_health) {
      for (const s of data.system_health.services) {
        if (s.status !== "running") list.push({ severity: "danger", category: "system", title: `${s.name} หยุดทำงาน`, detail: s.description })
      }
      for (const p of data.system_health.ports) {
        if (!p.open) list.push({ severity: "danger", category: "system", title: `Port ${p.port} (${p.name}) ปิดอยู่`, detail: "Service อาจล่ม — ตรวจสอบด่วน" })
      }
      if (data.system_health.cpu_pct >= 90) list.push({ severity: "danger", category: "system", title: `CPU สูง ${data.system_health.cpu_pct}%`, detail: `Load: ${data.system_health.load_avg}` })
      if (data.system_health.ram_pct >= 90) list.push({ severity: "warning", category: "system", title: `RAM สูง ${data.system_health.ram_pct}%`, detail: `${data.system_health.ram_used_mb.toLocaleString()} / ${data.system_health.ram_total_mb.toLocaleString()} MB` })
      if (data.system_health.disk_pct >= 80) list.push({ severity: data.system_health.disk_pct >= 90 ? "danger" : "warning", category: "system", title: `Disk เหลือน้อย ${data.system_health.disk_pct}%`, detail: `${data.system_health.disk_used_gb} / ${data.system_health.disk_total_gb} GB` })
    }

    const severityOrder: Record<Severity, number> = { danger: 0, warning: 1, info: 2 }
    list.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

    let danger = 0, warning = 0
    const cats = new Set<Category>()
    for (const a of list) {
      if (a.severity === "danger") danger++
      else if (a.severity === "warning") warning++
      cats.add(a.category)
    }
    return { alerts: list, dangerCount: danger, warningCount: warning, categories: [...cats] }
  }, [data])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">แจ้งเตือน</h1>
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
        <Card className={`border-t-4 ${dangerCount > 0 ? "border-t-red-500" : "border-t-green-500"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              วิกฤต
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold ${dangerCount > 0 ? "text-red-500" : "text-green-500"}`}>
              {dangerCount}
            </span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${warningCount > 0 ? "border-t-amber-500" : "border-t-green-500"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5" />
              เตือน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold ${warningCount > 0 ? "text-amber-500" : "text-green-500"}`}>
              {warningCount}
            </span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Bell className="h-3.5 w-3.5" />
              ทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{alerts.length}</span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>
      </div>

      {/* All clear */}
      {alerts.length === 0 && (
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-lg font-bold text-green-500">ทุกอย่างปกติ</p>
            <p className="text-sm text-muted-foreground">ไม่มีรายการแจ้งเตือน</p>
          </CardContent>
        </Card>
      )}

      {/* Alerts by category */}
      {categories.map((cat) => {
        const catAlerts = alerts.filter((a) => a.category === cat)
        const meta = CATEGORY_META[cat]
        const Icon = meta.icon
        return (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className={`h-4 w-4 ${meta.color}`} />
                {meta.label} ({catAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {catAlerts.map((alert, i) => (
                <div
                  key={i}
                  className={`flex items-start justify-between gap-4 p-3 rounded-lg border ${
                    alert.severity === "danger"
                      ? "border-red-500/20 bg-red-500/5"
                      : alert.severity === "warning"
                      ? "border-amber-500/20 bg-amber-500/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{alert.detail}</p>
                  </div>
                  <SeverityBadge severity={alert.severity} />
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
