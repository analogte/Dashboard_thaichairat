"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fetchMonitorData, type MonitorData } from "@/lib/api"
import { Newspaper, ExternalLink, RefreshCw } from "lucide-react"

export default function NewsPage() {
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
        <Newspaper className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">News</h1>
          <p className="text-sm text-muted-foreground">{data.updated_label}</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.news.map((n, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {n.url ? (
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      {n.title}
                    </a>
                  ) : (
                    <p className="font-medium">{n.title}</p>
                  )}
                  {n.age && (
                    <p className="text-xs text-muted-foreground mt-1">{n.age}</p>
                  )}
                </div>
                {n.url && (
                  <a href={n.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {data.news.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No news available</p>
        )}
      </div>
    </div>
  )
}
