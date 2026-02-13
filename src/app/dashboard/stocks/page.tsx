"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitorData } from "@/hooks/use-monitor-data"
import { TrendingUp, TrendingDown, RefreshCw, Minus } from "lucide-react"

export default function StocksPage() {
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

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-accent p-2">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Stock Watchlist</h1>
            <p className="text-sm text-muted-foreground">
              {data.updated_label}
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

      <div className="grid gap-4 md:grid-cols-2">
        {data.stocks.map((s) => {
          const isUp = s.change > 0
          const isDown = s.change < 0
          return (
            <Card
              key={s.symbol}
              className={`border-t-2 ${
                isUp
                  ? "border-t-emerald-500"
                  : isDown
                    ? "border-t-red-500"
                    : "border-t-muted-foreground"
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
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
                    <div className="flex items-center justify-end gap-1.5 mt-1.5">
                      {isUp ? (
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      ) : isDown ? (
                        <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                      ) : (
                        <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <Badge
                        variant="secondary"
                        className={`text-xs font-mono ${
                          isUp
                            ? "bg-emerald-500/15 text-emerald-400"
                            : isDown
                              ? "bg-red-500/15 text-red-400"
                              : ""
                        }`}
                      >
                        {isUp ? "+" : ""}
                        {s.change}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {data.stocks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8 col-span-2">
            No stock data
          </p>
        )}
      </div>
    </div>
  )
}
