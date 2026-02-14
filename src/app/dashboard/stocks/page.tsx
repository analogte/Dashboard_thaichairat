"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitor } from "@/lib/monitor-context"
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  DollarSign,
  Activity,
} from "lucide-react"

function fmtPrice(price: number | null, currency: string) {
  if (price == null) return "N/A"
  const sym = currency === "THB" ? "฿" : "$"
  return `${sym}${price.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function StocksPage() {
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

  const stocks = data.stocks
  const { upCount, downCount, avgChange } = useMemo(() => {
    let up = 0, down = 0, sum = 0
    for (const s of stocks) {
      if (s.change > 0) up++
      else if (s.change < 0) down++
      sum += s.change
    }
    return { upCount: up, downCount: down, avgChange: stocks.length > 0 ? sum / stocks.length : 0 }
  }, [stocks])

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">หุ้นที่ติดตาม</h1>
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
              <BarChart3 className="h-3.5 w-3.5" />
              ติดตาม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{stocks.length}</span>
            <span className="text-sm text-muted-foreground ml-2">ตัว</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              ขึ้น / ลง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">
              <span className="text-green-500">{upCount}</span>
              <span className="text-muted-foreground mx-1">/</span>
              <span className="text-red-500">{downCount}</span>
            </span>
            <span className="text-sm text-muted-foreground ml-2">ตัว</span>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${avgChange >= 0 ? "border-t-green-500" : "border-t-red-500"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              เฉลี่ยเปลี่ยนแปลง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold font-mono ${avgChange >= 0 ? "text-green-500" : "text-red-500"}`}>
              {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            รายการหุ้น
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">ชื่อ</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">สัญลักษณ์</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">ราคา</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">เปลี่ยนแปลง</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((s) => (
                  <tr key={s.symbol} className="border-b border-border/50 last:border-0">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3 text-muted-foreground font-mono">{s.symbol}</td>
                    <td className="py-3 text-right font-mono font-bold">
                      {fmtPrice(s.price, s.currency)}
                    </td>
                    <td className={`py-3 text-right font-mono font-bold ${s.change > 0 ? "text-green-500" : s.change < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                      {s.change > 0 ? "+" : ""}{s.change}%
                    </td>
                    <td className="py-3 text-center">
                      {s.change > 0 ? (
                        <Badge className="text-xs bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          ขึ้น
                        </Badge>
                      ) : s.change < 0 ? (
                        <Badge className="text-xs bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">
                          <TrendingDown className="h-3 w-3 mr-1" />
                          ลง
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">คงที่</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Cards (visual) */}
      <div className="grid gap-4 md:grid-cols-2">
        {stocks.map((s) => {
          const isUp = s.change > 0
          const isDown = s.change < 0
          const borderColor = isUp ? "border-l-green-500" : isDown ? "border-l-red-500" : "border-l-muted"
          return (
            <Card key={s.symbol} className={`border-l-4 ${borderColor}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">{s.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{s.symbol}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {s.currency === "THB" ? "ตลาดหลักทรัพย์ไทย" : "NASDAQ / NYSE"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-mono font-bold">
                      {fmtPrice(s.price, s.currency)}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-1">
                      {isUp && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {isDown && <TrendingDown className="h-4 w-4 text-red-500" />}
                      <span className={`text-sm font-mono font-bold ${isUp ? "text-green-500" : isDown ? "text-red-500" : "text-muted-foreground"}`}>
                        {isUp ? "+" : ""}{s.change}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {stocks.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">ไม่มีข้อมูลหุ้น</p>
      )}
    </div>
  )
}
