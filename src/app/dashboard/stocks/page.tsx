"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchMonitorData, type MonitorData } from "@/lib/api"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"

export default function StocksPage() {
  const [data, setData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const d = await fetchMonitorData()
    setData(d)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

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
        <p className="text-muted-foreground">Cannot connect to server</p>
        <button onClick={load} className="text-sm underline">Retry</button>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Stock Watchlist</h1>
          <p className="text-sm text-muted-foreground">{data.updated_label}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.stocks.map((s) => (
          <Card key={s.symbol}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{s.name}</p>
                  <p className="text-sm text-muted-foreground">{s.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-mono font-bold">
                    {s.price != null
                      ? `${s.currency === "THB" ? "\u0E3F" : "$"}${s.price.toLocaleString("en", { minimumFractionDigits: 2 })}`
                      : "N/A"}
                  </p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    {s.change > 0 ? (
                      <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                    ) : s.change < 0 ? (
                      <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                    ) : null}
                    <Badge
                      variant={s.change > 0 ? "default" : s.change < 0 ? "destructive" : "secondary"}
                      className="text-xs font-mono"
                    >
                      {s.change > 0 ? "+" : ""}{s.change}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {data.stocks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8 col-span-2">No stock data</p>
        )}
      </div>
    </div>
  )
}
