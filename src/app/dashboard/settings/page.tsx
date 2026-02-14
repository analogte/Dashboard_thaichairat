"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchMonitorData } from "@/lib/api"
import { useMonitor } from "@/lib/monitor-context"
import { useTheme } from "@/lib/theme-context"
import { useI18n, type Locale } from "@/lib/i18n"
import { loadSettings, saveSettings, getDefaults, type DashboardSettings } from "@/lib/settings-store"
import {
  Settings,
  Server,
  Database,
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Wifi,
  Sun,
  Moon,
  Monitor,
  Globe,
  Bell,
  RotateCcw,
} from "lucide-react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://46.225.19.81:8888"

const PAGES = [
  { name: "ภาพรวม", path: "/dashboard", dataKey: "shop" },
  { name: "ร้านค้า", path: "/dashboard/shop", dataKey: "shop_history" },
  { name: "สต็อก", path: "/dashboard/inventory", dataKey: "inventory" },
  { name: "พนักงาน", path: "/dashboard/employees", dataKey: "employee_stats" },
  { name: "หนี้ค้างชำระ", path: "/dashboard/payables", dataKey: "payables_data" },
  { name: "ลูกหนี้", path: "/dashboard/credits", dataKey: "credits_data" },
  { name: "ราคาตลาด", path: "/dashboard/market", dataKey: "market_stats" },
  { name: "หุ้น", path: "/dashboard/stocks", dataKey: "stocks" },
  { name: "ข่าวสาร", path: "/dashboard/news", dataKey: "news" },
  { name: "เงินเก็บ", path: "/dashboard/savings", dataKey: "savings_data" },
  { name: "ระบบ", path: "/dashboard/system", dataKey: "system_health" },
  { name: "กำไรขาดทุน", path: "/dashboard/pnl", dataKey: "pnl_data" },
  { name: "วิเคราะห์สินค้า", path: "/dashboard/analytics", dataKey: "stock_history" },
  { name: "ปฏิทินร้าน", path: "/dashboard/calendar", dataKey: "shop_history" },
  { name: "เปรียบเทียบสาขา", path: "/dashboard/compare", dataKey: "shop" },
]

const DATA_SOURCES = [
  { name: "ยอดขาย / สต็อก / พนักงาน", source: "Supabase" },
  { name: "หนี้ supplier / ลูกหนี้", source: "Supabase" },
  { name: "ราคาตลาด", source: "DIT (pricelist.dit.go.th)" },
  { name: "หุ้น", source: "Yahoo Finance" },
  { name: "ข่าวสาร", source: "Brave Search" },
]

const THEME_OPTIONS = [
  { value: "dark" as const, label: "มืด", icon: Moon },
  { value: "light" as const, label: "สว่าง", icon: Sun },
  { value: "system" as const, label: "ตามระบบ", icon: Monitor },
]

const LANG_OPTIONS: { value: Locale; label: string }[] = [
  { value: "th", label: "ไทย" },
  { value: "en", label: "English" },
]

const REFRESH_OPTIONS = [
  { value: 1, label: "1 นาที" },
  { value: 3, label: "3 นาที" },
  { value: 5, label: "5 นาที" },
  { value: 10, label: "10 นาที" },
  { value: 15, label: "15 นาที" },
]

export default function SettingsPage() {
  const { data, loading, refresh } = useMonitor()
  const { theme, setTheme } = useTheme()
  const { locale, setLocale } = useI18n()
  const [pingMs, setPingMs] = useState<number | null>(null)
  const [pinging, setPinging] = useState(false)
  const [settings, setSettings] = useState<DashboardSettings>(getDefaults)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const testPing = useCallback(async () => {
    setPinging(true)
    const start = Date.now()
    const d = await fetchMonitorData()
    const elapsed = Date.now() - start
    setPingMs(d !== null ? elapsed : null)
    setPinging(false)
    refresh()
  }, [refresh])

  const handleSaveSettings = useCallback(() => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [settings])

  const handleResetDefaults = useCallback(() => {
    const defaults = getDefaults()
    setSettings(defaults)
    saveSettings(defaults)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const updateThreshold = useCallback(
    (key: keyof DashboardSettings["alertThresholds"], value: number) => {
      setSettings((prev) => ({
        ...prev,
        alertThresholds: { ...prev.alertThresholds, [key]: value },
      }))
    },
    [],
  )

  const serverOnline = data !== null

  const updatedAt = data?.updated_at
    ? new Date(data.updated_at).toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "-"

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">ตั้งค่า</h1>
            <p className="text-sm text-muted-foreground">การตั้งค่าและข้อมูลระบบ</p>
          </div>
        </div>
        <button
          onClick={testPing}
          disabled={pinging}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${pinging ? "animate-spin" : ""}`} />
          ทดสอบ
        </button>
      </div>

      {/* Appearance & Preferences */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sun className="h-4 w-4" />
              ธีม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {THEME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors flex-1 justify-center ${
                    theme === opt.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20"
                  }`}
                  aria-pressed={theme === opt.value}
                >
                  <opt.icon className="h-4 w-4" />
                  {opt.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              ภาษา
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLocale(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors flex-1 justify-center ${
                    locale === opt.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/20"
                  }`}
                  aria-pressed={locale === opt.value}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh Interval */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            ความถี่รีเฟรช
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {REFRESH_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSettings((prev) => ({ ...prev, refreshInterval: opt.value }))}
                className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                  settings.refreshInterval === opt.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/20"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            เกณฑ์การแจ้งเตือน
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              ค่าเริ่มต้น
            </button>
            <button
              onClick={handleSaveSettings}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors ${
                saved
                  ? "bg-green-500/10 text-green-500 border border-green-500/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  บันทึกแล้ว
                </>
              ) : (
                "บันทึก"
              )}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "debtWarning" as const, label: "หนี้ supplier เตือน (฿)", color: "amber" },
              { key: "debtDanger" as const, label: "หนี้ supplier อันตราย (฿)", color: "red" },
              { key: "creditWarning" as const, label: "ลูกหนี้ เตือน (฿)", color: "amber" },
              { key: "creditDanger" as const, label: "ลูกหนี้ อันตราย (฿)", color: "red" },
              { key: "wageBudgetWarning" as const, label: "งบค่าแรง เตือน (%)", color: "amber" },
              { key: "wageBudgetDanger" as const, label: "งบค่าแรง อันตราย (%)", color: "red" },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-xs text-muted-foreground" htmlFor={field.key}>
                  {field.label}
                </label>
                <input
                  id={field.key}
                  type="number"
                  value={settings.alertThresholds[field.key]}
                  onChange={(e) => updateThreshold(field.key, Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-md border bg-background text-sm font-mono focus:outline-none focus:ring-2 ${
                    field.color === "red"
                      ? "focus:ring-red-500/30 border-red-500/20"
                      : "focus:ring-amber-500/30 border-amber-500/20"
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Server Status */}
      <Card className={`border-t-4 ${serverOnline === true ? "border-t-green-500" : serverOnline === false ? "border-t-red-500" : "border-t-muted"}`}>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wifi className="h-4 w-4" />
            สถานะเซิร์ฟเวอร์
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">สถานะ</p>
              {loading || pinging ? (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : serverOnline ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-500">ออนไลน์</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium text-red-500">ออฟไลน์</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Response Time</p>
              <span className="font-mono font-medium">
                {pingMs != null ? `${pingMs} ms` : "-"}
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">อัปเดตล่าสุด</p>
              <span className="font-medium text-sm">{updatedAt}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Endpoint</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{API_URL}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              แหล่งข้อมูล ({DATA_SOURCES.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {DATA_SOURCES.map((ds) => (
              <div key={ds.name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{ds.name}</span>
                <Badge variant="outline" className="text-xs font-mono">{ds.source}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dashboard Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              หน้าแดชบอร์ด ({PAGES.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {PAGES.map((p) => {
              const hasData = data ? !!(data as unknown as Record<string, unknown>)[p.dataKey] : false
              return (
                <div key={p.path} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{p.name}</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-muted-foreground">{p.dataKey}</code>
                    {data && (
                      hasData ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* API Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              โครงสร้างระบบ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Frontend</span>
              <span>Next.js (localhost:3000)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Backend</span>
              <span>VPS (Hetzner)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <span>Supabase (PostgreSQL)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Bot</span>
              <span>ClawBot (OpenClaw)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Telegram</span>
              <span>@analog17_vps_bot</span>
            </div>
          </CardContent>
        </Card>

        {/* Auto Refresh */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              รีเฟรชอัตโนมัติ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">VPS อัปเดต JSON</span>
              <span>ทุก 2 ชั่วโมง (cron)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">สรุปสัปดาห์</span>
              <span>อาทิตย์ 21:00 → Telegram</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ดึงราคาตลาด DIT</span>
              <span>ทุกวัน 06:00</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
