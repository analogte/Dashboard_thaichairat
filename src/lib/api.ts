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

export interface DailyRecord {
  date: string
  income: number
  expense: number
  profit: number
  branches: { branch: string; income: number; expense: number; profit: number }[]
}

export interface PeriodSummary {
  income: number
  expense: number
  profit: number
  days: number
  change_pct?: number
}

export interface EmployeeInfo {
  name: string
  type: string
  wage: number
  shift: string
  notes: string
}

export interface AttendanceRecord {
  name: string
  type: string
  status: string
  wage: number
}

export interface BranchMonthlySummary {
  branch: string
  income: number
  expense: number
  profit: number
}

export interface ShopHistory {
  daily: DailyRecord[]
  branch_monthly: BranchMonthlySummary[]
  week: PeriodSummary
  month: PeriodSummary
  employees: EmployeeInfo[]
  attendance: AttendanceRecord[]
  attendance_date: string
}

export interface InventoryItem {
  product: string
  quantity: number
  unit: string
  min_stock: number
  category: string
}

export interface InventoryLog {
  time: string
  product: string
  type: string
  before: number
  after: number
  reason: string
}

export interface InventoryData {
  items: InventoryItem[]
  low_stock: InventoryItem[]
  recent_logs: InventoryLog[]
  summary: {
    total_products: number
    low_count: number
    updated: string
  }
}

export interface StockDailySummary {
  date: string
  total_received: number
  total_sold: number
  items: number
  est_cogs: number
  est_revenue: number
}

export interface TopMover {
  product: string
  total_sold: number
  total_received: number
  unit: string
  category: string
  days: number
  avg_daily: number
}

export interface StockPrediction {
  product: string
  avg_daily_sold: number
  current_stock: number
  days_until_zero: number
  unit: string
  category: string
  suggest_order: boolean
}

export interface StockTodaySummary {
  total_received: number
  total_sold: number
  estimated_cogs: number
  estimated_revenue: number
  items_count: number
}

export interface StockHistory {
  daily_summary: StockDailySummary[]
  top_movers: TopMover[]
  predictions: StockPrediction[]
  today: StockTodaySummary
}

export interface EmployeeMonthlyStat {
  name: string
  type: string
  wage_rate: number
  days_worked: number
  days_leave: number
  days_absent: number
  total_wage_paid: number
  attendance_rate: number
}

export interface DailyAttendanceTrend {
  date: string
  present: number
  total_wage: number
}

export interface MonthlySummary {
  total_days_worked: number
  total_wages_paid: number
  budget_used_pct: number
  budget_remaining: number
  avg_daily_wage_cost: number
}

export interface EmployeeStats {
  month_label: string
  budget: number
  total_employees: number
  active_today: number
  today_wages: number
  monthly_summary: MonthlySummary
  employee_monthly: EmployeeMonthlyStat[]
  daily_trend: DailyAttendanceTrend[]
  today_attendance: AttendanceRecord[]
}

export interface MarketProduct {
  name: string
  category: string
  dit_min: number
  dit_max: number
  dit_unit: string
  change_pct: number | null
  shop_price: number | null
  shop_unit: string | null
  unit_note: string | null
}

export interface MarketPriceHistoryDate {
  date: string
  items: { name: string; min: number; max: number }[]
}

export interface MarketAlert {
  name: string
  change_pct: number
  direction: "up" | "down"
  dit_min: number
  dit_max: number
  prev_min: number
  prev_max: number
}

export interface MarketStats {
  date: string
  total_products: number
  tracked_products: number
  alerts_count: number
  avg_change_pct: number
  products: MarketProduct[]
  price_history: MarketPriceHistoryDate[]
  alerts: MarketAlert[]
}

export interface PayableSupplier {
  supplier: string
  total_debt: number
  total_paid: number
  balance: number
}

export interface PayablesData {
  suppliers: PayableSupplier[]
  total_outstanding: number
  count: number
}

export interface CreditCustomer {
  customer: string
  total_credit: number
  total_paid: number
  balance: number
}

export interface CreditsData {
  customers: CreditCustomer[]
  total_outstanding: number
  count: number
}

export interface SystemService {
  name: string
  description: string
  status: string
}

export interface SystemPort {
  port: number
  name: string
  open: boolean
}

export interface TailscalePeer {
  hostname: string
  ip: string
  online: boolean
  os: string
  last_seen: string
}

export interface SystemHealth {
  cpu_pct: number
  ram_pct: number
  ram_used_mb: number
  ram_total_mb: number
  disk_pct: number
  disk_used_gb: number
  disk_total_gb: number
  uptime: string
  load_avg: string
  services: SystemService[]
  ports: SystemPort[]
  tailscale: {
    self_ip: string
    self_hostname: string
    peers: TailscalePeer[]
  }
  connections: number
}

export interface SavingsHistory {
  date: string
  amount: number
  cumulative: number
}

export interface SavingsData {
  total: number
  entries: number
  daily_cost: number
  cover_days: number
  risk: string
  history: SavingsHistory[]
}

export interface MonitorData {
  updated_at: string
  updated_label: string
  stocks: StockData[]
  market: { items: MarketItem[]; date: string }
  shop: ShopData
  shop_history: ShopHistory
  news: NewsItem[]
  inventory: InventoryData
  stock_history?: StockHistory
  employee_stats?: EmployeeStats
  market_stats?: MarketStats
  payables_data?: PayablesData
  credits_data?: CreditsData
  system_health?: SystemHealth
  savings_data?: SavingsData
}

export async function fetchMonitorData(): Promise<MonitorData | null> {
  try {
    const res = await fetch(`${API_BASE}/monitor_data.json?t=${Date.now()}`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
