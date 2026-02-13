"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type SystemHealth } from "@/lib/api"
import { useMonitor } from "@/lib/monitor-context"
import {
  Monitor,
  RefreshCw,
  Cpu,
  HardDrive,
  MemoryStick,
  Wifi,
  WifiOff,
  Activity,
  Server,
  CheckCircle2,
  XCircle,
  Clock,
  Network,
} from "lucide-react"

function pctColor(pct: number) {
  if (pct >= 90) return "text-red-500"
  if (pct >= 70) return "text-amber-500"
  return "text-green-500"
}

function pctBorder(pct: number) {
  if (pct >= 90) return "border-t-red-500"
  if (pct >= 70) return "border-t-amber-500"
  return "border-t-green-500"
}

function ProgressBar({ pct, className }: { pct: number; className?: string }) {
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-green-500"
  return (
    <div className={`w-full bg-muted rounded-full h-2.5 mt-2 ${className || ""}`}>
      <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

export default function SystemPage() {
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

  const sys: SystemHealth | undefined = data.system_health
  if (!sys) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">ไม่มีข้อมูลระบบ — รัน update_monitor.py ใหม่</p>
        <button onClick={load} className="text-sm underline">ลองใหม่</button>
      </div>
    )
  }

  const allServicesUp = sys.services.every((s) => s.status === "running")
  const allPortsOpen = sys.ports.every((p) => p.open)
  const macOnline = sys.tailscale?.peers?.some((p) => p.online) ?? false

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Monitor className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Infrastructure Monitor</h1>
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

      {/* System Resources — KPI */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className={`border-t-4 ${pctBorder(sys.cpu_pct)}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold font-mono ${pctColor(sys.cpu_pct)}`}>{sys.cpu_pct}%</span>
            <ProgressBar pct={sys.cpu_pct} />
            <p className="text-xs text-muted-foreground mt-1.5">Load: {sys.load_avg}</p>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${pctBorder(sys.ram_pct)}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <MemoryStick className="h-3.5 w-3.5" />
              RAM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold font-mono ${pctColor(sys.ram_pct)}`}>{sys.ram_pct}%</span>
            <ProgressBar pct={sys.ram_pct} />
            <p className="text-xs text-muted-foreground mt-1.5">
              {sys.ram_used_mb.toLocaleString()} / {sys.ram_total_mb.toLocaleString()} MB
            </p>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${pctBorder(sys.disk_pct)}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5" />
              Disk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold font-mono ${pctColor(sys.disk_pct)}`}>{sys.disk_pct}%</span>
            <ProgressBar pct={sys.disk_pct} />
            <p className="text-xs text-muted-foreground mt-1.5">
              {sys.disk_used_gb} / {sys.disk_total_gb} GB
            </p>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-lg font-bold">{sys.uptime || "-"}</span>
            <p className="text-xs text-muted-foreground mt-1.5">
              Connections: {sys.connections}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              Services
              {allServicesUp ? (
                <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20 ml-auto">All Running</Badge>
              ) : (
                <Badge variant="destructive" className="text-xs ml-auto">Issue</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sys.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium font-mono">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                  {s.status === "running" ? (
                    <div className="flex items-center gap-1.5 text-green-500">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Running</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-500">
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Stopped</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ports */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Ports
              {allPortsOpen ? (
                <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20 ml-auto">All Open</Badge>
              ) : (
                <Badge variant="destructive" className="text-xs ml-auto">Issue</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sys.ports.map((p) => (
                <div key={p.port} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">:{p.port}</p>
                  </div>
                  {p.open ? (
                    <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Open
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Closed
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tailscale Network */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="h-4 w-4" />
            Tailscale VPN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Node</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">IP</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">OS</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {/* Self (VPS) */}
                {sys.tailscale?.self_hostname && (
                  <tr className="border-b border-border/50">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">{sys.tailscale.self_hostname}</span>
                        <Badge variant="outline" className="text-xs">VPS</Badge>
                      </div>
                    </td>
                    <td className="py-2.5 font-mono text-muted-foreground">{sys.tailscale.self_ip}</td>
                    <td className="py-2.5 text-muted-foreground">Linux</td>
                    <td className="py-2.5 text-center">
                      <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                        <Wifi className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </td>
                  </tr>
                )}
                {/* Peers */}
                {sys.tailscale?.peers?.map((p) => (
                  <tr key={p.hostname} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{p.hostname}</span>
                        <Badge variant="outline" className="text-xs">{p.os}</Badge>
                      </div>
                    </td>
                    <td className="py-2.5 font-mono text-muted-foreground">{p.ip}</td>
                    <td className="py-2.5 text-muted-foreground">{p.os}</td>
                    <td className="py-2.5 text-center">
                      {p.online ? (
                        <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                          <Wifi className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                      ) : (
                        <Badge className="text-xs bg-red-500/10 text-red-500 border-red-500/20">
                          <WifiOff className="h-3 w-3 mr-1" />
                          Offline
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
