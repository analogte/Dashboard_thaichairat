"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMonitorData, type MonitorData } from "@/lib/api"
import { ShoppingBasket, RefreshCw } from "lucide-react"

export default function MarketPage() {
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
        <ShoppingBasket className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Market Prices</h1>
          <p className="text-sm text-muted-foreground">{data.market.date}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Prices (DIT)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {data.market.items.map((m) => {
              const avg = (m.min + m.max) / 2
              const maxPrice = Math.max(...data.market.items.map((i) => i.max))
              const pct = maxPrice > 0 ? (avg / maxPrice) * 100 : 0
              return (
                <div key={m.name} className="flex items-center gap-4 py-3">
                  <div className="w-32 shrink-0">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">/{m.unit}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-sm font-mono">{m.min}-{m.max}</span>
                  </div>
                </div>
              )
            })}
            {data.market.items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No market data</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
