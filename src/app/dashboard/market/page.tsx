"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMonitorData } from "@/hooks/use-monitor-data"
import { ShoppingBasket, RefreshCw } from "lucide-react"

export default function MarketPage() {
  const { data, loading, refresh } = useMonitorData()

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
        <button onClick={refresh} className="text-sm underline">
          Retry
        </button>
      </div>
    )
  }

  const maxPrice = Math.max(...data.market.items.map((i) => i.max), 1)

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <ShoppingBasket className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Market Prices</h1>
            <p className="text-sm text-muted-foreground">
              {data.market.date}
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition rounded-lg border border-border px-3 py-1.5 hover:bg-accent"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Today&apos;s Prices (DIT)
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {data.market.items.length} items tracked
          </p>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {data.market.items.map((m) => {
              const avg = (m.min + m.max) / 2
              const pct = maxPrice > 0 ? (avg / maxPrice) * 100 : 0
              return (
                <div
                  key={m.name}
                  className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="w-36 shrink-0">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">/{m.unit}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500/70 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-28 text-right">
                    <span className="text-sm font-mono font-medium">
                      {m.min}-{m.max}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ฿
                    </span>
                  </div>
                </div>
              )
            })}
            {data.market.items.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                No market data
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
