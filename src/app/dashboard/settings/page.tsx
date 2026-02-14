"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchMonitorData } from "@/lib/api"
import { useMonitor } from "@/lib/monitor-context"
import { hasPin, setPin, removePin, verifyPin } from "@/lib/pin-utils"
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
  Lock,
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
]

const DATA_SOURCES = [
  { name: "ยอดขาย / สต็อก / พนักงาน", source: "Supabase" },
  { name: "หนี้ supplier / ลูกหนี้", source: "Supabase" },
  { name: "ราคาตลาด", source: "DIT (pricelist.dit.go.th)" },
  { name: "หุ้น", source: "Yahoo Finance" },
  { name: "ข่าวสาร", source: "Brave Search" },
]

export default function SettingsPage() {
  const { data, loading, refresh } = useMonitor()
  const [pingMs, setPingMs] = useState<number | null>(null)
  const [pinging, setPinging] = useState(false)
  const [pinEnabled, setPinEnabled] = useState(false)
  const [pinAction, setPinAction] = useState<"none" | "change" | "remove">("none")
  const [oldPin, setOldPin] = useState("")
  const [newPin, setNewPin] = useState("")
  const [pinMsg, setPinMsg] = useState("")

  useEffect(() => {
    setPinEnabled(hasPin())
  }, [])

  async function handlePinChange() {
    if (pinEnabled) {
      const ok = await verifyPin(oldPin)
      if (!ok) { setPinMsg("PIN เดิมไม่ถูกต้อง"); return }
    }
    if (newPin.length < 4) { setPinMsg("PIN ต้องมีอย่างน้อย 4 หลัก"); return }
    await setPin(newPin)
    setPinEnabled(true)
    setPinAction("none")
    setOldPin(""); setNewPin("")
    setPinMsg("เปลี่ยน PIN สำเร็จ")
    setTimeout(() => setPinMsg(""), 2000)
  }

  async function handlePinRemove() {
    const ok = await verifyPin(oldPin)
    if (!ok) { setPinMsg("PIN ไม่ถูกต้อง"); return }
    removePin()
    setPinEnabled(false)
    setPinAction("none")
    setOldPin("")
    setPinMsg("ลบ PIN สำเร็จ")
    setTimeout(() => setPinMsg(""), 2000)
  }

  const testPing = useCallback(async () => {
    setPinging(true)
    const start = Date.now()
    const d = await fetchMonitorData()
    const elapsed = Date.now() - start
    setPingMs(d !== null ? elapsed : null)
    setPinging(false)
    refresh()
  }, [refresh])

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

        {/* PIN Lock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lock className="h-4 w-4" />
              PIN ล็อกข้อมูลส่วนตัว
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">สถานะ</span>
              <Badge variant={pinEnabled ? "default" : "outline"}>
                {pinEnabled ? "เปิดใช้งาน" : "ปิด"}
              </Badge>
            </div>
            {pinMsg && <p className="text-sm text-green-600">{pinMsg}</p>}
            {pinAction === "none" ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPinAction("change")}>
                  {pinEnabled ? "เปลี่ยน PIN" : "ตั้ง PIN"}
                </Button>
                {pinEnabled && (
                  <Button size="sm" variant="outline" onClick={() => setPinAction("remove")}>
                    ลบ PIN
                  </Button>
                )}
              </div>
            ) : pinAction === "change" ? (
              <div className="space-y-2">
                {pinEnabled && (
                  <Input
                    type="password" inputMode="numeric" maxLength={6}
                    placeholder="PIN เดิม" value={oldPin}
                    onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))}
                  />
                )}
                <Input
                  type="password" inputMode="numeric" maxLength={6}
                  placeholder="PIN ใหม่ (4-6 หลัก)" value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handlePinChange}>บันทึก</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setPinAction("none"); setOldPin(""); setNewPin(""); setPinMsg("") }}>
                    ยกเลิก
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  type="password" inputMode="numeric" maxLength={6}
                  placeholder="ใส่ PIN เพื่อยืนยันการลบ" value={oldPin}
                  onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="destructive" onClick={handlePinRemove}>ยืนยันลบ</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setPinAction("none"); setOldPin(""); setPinMsg("") }}>
                    ยกเลิก
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
