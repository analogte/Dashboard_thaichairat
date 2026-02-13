const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://46.225.19.81:8888"

export interface StockData {
  name: string
  symbol: string
  price: number | null
  currency: string
  change: number
}

export interface MarketItem {
  name: string
  min: number
  max: number
  unit: string
}

export interface BranchData {
  name: string
  income: number
  expense: number
  profit: number
}

export interface ShopData {
  date: string
  income: number
  expense: number
  profit: number
  workers: number
  wages: number
  branches: BranchData[]
  has_data: boolean
}

export interface NewsItem {
  title: string
  url: string
  age: string
}

export interface MonitorData {
  updated_at: string
  updated_label: string
  stocks: StockData[]
  market: { items: MarketItem[]; date: string }
  shop: ShopData
  news: NewsItem[]
}

export async function fetchMonitorData(): Promise<MonitorData | null> {
  try {
    const res = await fetch(`${API_BASE}/monitor_data.json?t=${Date.now()}`, {
      cache: "no-store",
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
