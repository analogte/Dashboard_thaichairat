"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Server, Database, Clock } from "lucide-react"

export default function SettingsPage() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://46.225.19.81:8888"

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-accent p-2">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configuration &amp; Info
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              API Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Endpoint</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {apiUrl}
              </code>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Data Source</span>
              <span>VPS (Hetzner)</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shop Data</span>
              <span>Supabase</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Market Prices</span>
              <span>DIT (pricelist.dit.go.th)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stocks</span>
              <span>Yahoo Finance</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">News</span>
              <span>Brave Search</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Auto Refresh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">VPS Cron</span>
              <span>Every 2 hours</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dashboard Poll</span>
              <span>Every 5 minutes</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
