"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMonitor } from "@/lib/monitor-context"
import {
  Newspaper,
  ExternalLink,
  RefreshCw,
  Globe,
  Clock,
} from "lucide-react"

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return hostname.replace("www.", "")
  } catch {
    return ""
  }
}

function isThai(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text)
}

export default function NewsPage() {
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

  const news = data.news
  const thaiNews = news.filter((n) => isThai(n.title))
  const techNews = news.filter((n) => !isThai(n.title))

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">ข่าวสาร</h1>
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

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Newspaper className="h-3.5 w-3.5" />
              ข่าวทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{news.length}</span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              ข่าวตลาด/ผัก-ผลไม้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">{thaiNews.length}</span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              ข่าว AI / Tech
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-purple-500">{techNews.length}</span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>
      </div>

      {/* Thai News Section */}
      {thaiNews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              ข่าวตลาด / ผัก-ผลไม้ ({thaiNews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {thaiNews.map((n, i) => (
              <a
                key={i}
                href={n.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium group-hover:underline leading-relaxed">{n.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {n.age && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {n.age}
                      </span>
                    )}
                    {n.url && (
                      <span className="text-xs text-muted-foreground">
                        {extractDomain(n.url)}
                      </span>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tech News Section */}
      {techNews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              AI / Technology ({techNews.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {techNews.map((n, i) => (
              <a
                key={i}
                href={n.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium group-hover:underline leading-relaxed">{n.title}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {n.age && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {n.age}
                      </span>
                    )}
                    {n.url && (
                      <span className="text-xs text-muted-foreground">
                        {extractDomain(n.url)}
                      </span>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </CardContent>
        </Card>
      )}

      {news.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 gap-2">
          <Newspaper className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">ไม่มีข่าว</p>
        </div>
      )}
    </div>
  )
}
