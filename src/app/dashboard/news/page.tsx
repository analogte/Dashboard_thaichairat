"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useMonitorData } from "@/hooks/use-monitor-data"
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react"

export default function NewsPage() {
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
            <Newspaper className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">News</h1>
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

      <div className="space-y-3">
        {data.news.map((n, i) => (
          <Card key={i}>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3 items-start min-w-0">
                  <span className="text-xs font-mono text-muted-foreground mt-0.5 shrink-0 w-5 text-right">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    {n.url ? (
                      <a
                        href={n.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline leading-snug"
                      >
                        {n.title}
                      </a>
                    ) : (
                      <p className="font-medium leading-snug">{n.title}</p>
                    )}
                    {n.age && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {n.age}
                      </p>
                    )}
                  </div>
                </div>
                {n.url && (
                  <a
                    href={n.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md p-1.5 hover:bg-accent transition"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {data.news.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No news available
          </p>
        )}
      </div>
    </div>
  )
}
