"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type MarketProduct } from "@/lib/api"
import { exportCSV } from "@/lib/export"
import { useMonitor } from "@/lib/monitor-context"
import {
  ShoppingBasket,
  RefreshCw,
  Store,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from "lucide-react"

const MarketPriceChart = dynamic(() => import("@/components/market-price-chart"), { ssr: false })
const MarketComparisonChart = dynamic(() => import("@/components/market-comparison-chart"), { ssr: false })

function fmt(n: number | null | undefined) {
  if (n == null || isNaN(n)) return "0"
  return Number(n).toLocaleString("th-TH", { maximumFractionDigits: 1 })
}

const CATEGORIES = ["ทั้งหมด", "ผัก", "ผลไม้", "เครื่องปรุง", "อื่นๆ"] as const

export default function MarketPage() {
  const { data, loading, refresh: load } = useMonitor()
  const [categoryFilter, setCategoryFilter] = useState<string>("ทั้งหมด")
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

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

  const ms = data.market_stats

  // Fallback: ถ้าไม่มี market_stats → แสดง UI เดิม
  if (!ms) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-3">
          <ShoppingBasket className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">ราคาตลาด</h1>
            <p className="text-sm text-muted-foreground">{data.market.date}</p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ราคาวันนี้ (กรมการค้าภายใน)</CardTitle>
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
                <p className="text-sm text-muted-foreground text-center py-8">ไม่มีข้อมูลราคาตลาด</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // New UI with market_stats
  const filteredProducts: MarketProduct[] = categoryFilter === "ทั้งหมด"
    ? ms.products
    : ms.products.filter((p) => p.category === categoryFilter)

  const alertSet = new Set(ms.alerts.map((a) => a.name))

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBasket className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">ราคาตลาด</h1>
            <p className="text-sm text-muted-foreground">{ms.date} (กรมการค้าภายใน)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              exportCSV("market-prices", ["สินค้า", "หมวด", "ราคาต่ำ", "ราคาสูง", "หน่วย", "เปลี่ยน%", "ราคาร้าน"],
                ms.products, ["name", "category", "dit_min", "dit_max", "dit_unit", "change_pct", "shop_price"])
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            รีเฟรช
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <ShoppingBasket className="h-3.5 w-3.5" />
              สินค้าทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{ms.total_products}</span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5" />
              ร้านติดตาม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-500">{ms.tracked_products}</span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>

        <Card className={`border-t-4 ${ms.alerts_count > 0 ? "border-t-red-500" : "border-t-orange-500"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              ราคาผันผวน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold ${ms.alerts_count > 0 ? "text-red-500" : ""}`}>
              {ms.alerts_count}
            </span>
            <span className="text-sm text-muted-foreground ml-2">รายการ</span>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
              {ms.avg_change_pct >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              เปลี่ยนแปลงเฉลี่ย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`text-3xl font-bold ${ms.avg_change_pct > 0 ? "text-red-500" : ms.avg_change_pct < 0 ? "text-green-500" : ""}`}>
              {ms.avg_change_pct > 0 ? "+" : ""}{fmt(ms.avg_change_pct)}%
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              แนวโน้มราคา
              {selectedProduct && (
                <Badge variant="secondary" className="text-xs ml-2">
                  {selectedProduct}
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="ml-1.5 hover:text-foreground"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarketPriceChart history={ms.price_history} selectedProduct={selectedProduct} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4" />
              ราคาร้าน vs ตลาด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MarketComparisonChart products={ms.products} />
          </CardContent>
        </Card>
      </div>

      {/* Alerts Card */}
      {ms.alerts.length > 0 && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              แจ้งเตือนราคาผันผวน ({ms.alerts.length} รายการ)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {ms.alerts.map((a) => (
                <Badge
                  key={a.name}
                  variant={a.direction === "up" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {a.name}: {a.direction === "up" ? "+" : ""}{fmt(a.change_pct)}%
                  {a.direction === "up" ? (
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBasket className="h-4 w-4" />
              รายการราคาตลาด ({filteredProducts.length})
            </CardTitle>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    categoryFilter === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">สินค้า</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">หมวด</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">ราคาตลาด (DIT)</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">ราคาร้าน</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">เปลี่ยนแปลง</th>
                  <th className="text-left py-2 pl-4 text-muted-foreground font-medium">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const isAlert = alertSet.has(p.name)
                  const isTracked = p.shop_price !== null
                  const bgClass = isAlert
                    ? p.change_pct && p.change_pct > 0
                      ? "bg-red-500/5"
                      : "bg-green-500/5"
                    : ""

                  return (
                    <tr
                      key={p.name}
                      className={`border-b border-border/50 last:border-0 cursor-pointer hover:bg-muted/30 ${bgClass}`}
                      onClick={() => setSelectedProduct(p.name)}
                    >
                      <td className={`py-2.5 font-medium ${!isTracked ? "text-muted-foreground" : ""}`}>
                        {p.name}
                      </td>
                      <td className="py-2.5 text-muted-foreground">{p.category}</td>
                      <td className="py-2.5 text-right font-mono">
                        {fmt(p.dit_min)}-{fmt(p.dit_max)} <span className="text-muted-foreground text-xs">/{p.dit_unit}</span>
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {isTracked ? (
                          <>
                            {fmt(p.shop_price)} <span className="text-muted-foreground text-xs">/{p.shop_unit}</span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-mono">
                        {p.change_pct !== null ? (
                          <span className={
                            p.change_pct > 0
                              ? "text-red-500"
                              : p.change_pct < 0
                              ? "text-green-500"
                              : ""
                          }>
                            {p.change_pct > 0 ? "+" : ""}{fmt(p.change_pct)}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pl-4 text-xs text-muted-foreground">
                        {p.unit_note || ""}
                      </td>
                    </tr>
                  )
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-muted-foreground">ไม่มีข้อมูล</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
