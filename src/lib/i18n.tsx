"use client"

import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from "react"

export type Locale = "th" | "en"

const translations: Record<Locale, Record<string, string>> = {
  th: {
    // Navigation
    "nav.menu": "เมนู",
    "nav.overview": "ภาพรวม",
    "nav.alerts": "แจ้งเตือน",
    "nav.shop": "ร้านค้า",
    "nav.calendar": "ปฏิทินร้าน",
    "nav.pnl": "กำไรขาดทุน",
    "nav.inventory": "สต็อก",
    "nav.analytics": "วิเคราะห์สินค้า",
    "nav.employees": "พนักงาน",
    "nav.payables": "หนี้ค้างชำระ",
    "nav.credits": "ลูกหนี้",
    "nav.savings": "เงินเก็บ",
    "nav.market": "ราคาตลาด",
    "nav.stocks": "หุ้น",
    "nav.news": "ข่าวสาร",
    "nav.system": "ระบบ",
    "nav.settings": "ตั้งค่า",
    "nav.compare": "เปรียบเทียบสาขา",

    // Common
    "common.refresh": "รีเฟรช",
    "common.loading": "กำลังโหลด...",
    "common.retry": "ลองใหม่",
    "common.export_csv": "ส่งออก CSV",
    "common.export_pdf": "ส่งออก PDF",
    "common.search": "ค้นหา...",
    "common.no_data": "ไม่มีข้อมูล",
    "common.baht": "บาท",
    "common.days": "วัน",
    "common.error": "เกิดข้อผิดพลาด",
    "common.close": "ปิด",

    // Dashboard
    "dashboard.title": "แดชบอร์ด ไทยชัยรัตย์",
    "dashboard.hello": "สวัสดีครับ เจ้าของ",
    "dashboard.income": "รายรับ",
    "dashboard.expense": "รายจ่าย",
    "dashboard.profit_today": "กำไรวันนี้",
    "dashboard.margin": "มาร์จิ้น",
    "dashboard.profit_month": "กำไรเดือนนี้",
    "dashboard.trend_summary": "สรุปแนวโน้ม",
    "dashboard.financial_health": "สุขภาพการเงิน",
    "dashboard.branch_performance": "ผลประกอบการสาขา",
    "dashboard.tracked_stocks": "หุ้นที่ติดตาม",
    "dashboard.market_prices": "ราคาตลาด",
    "dashboard.this_week": "สัปดาห์นี้",
    "dashboard.this_month": "เดือนนี้",
    "dashboard.vs_last_week": "vs สัปดาห์ก่อน",
    "dashboard.vs_last_month": "vs เดือนก่อน",
    "dashboard.issues_to_check": "เรื่องต้องดู",
    "dashboard.critical": "วิกฤต",
    "dashboard.no_connection": "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์",

    // Settings
    "settings.title": "ตั้งค่า",
    "settings.subtitle": "การตั้งค่าและข้อมูลระบบ",
    "settings.theme": "ธีม",
    "settings.theme_dark": "มืด",
    "settings.theme_light": "สว่าง",
    "settings.theme_system": "ตามระบบ",
    "settings.language": "ภาษา",
    "settings.refresh_interval": "ความถี่รีเฟรช",
    "settings.server_status": "สถานะเซิร์ฟเวอร์",
    "settings.online": "ออนไลน์",
    "settings.offline": "ออฟไลน์",
    "settings.test": "ทดสอบ",
    "settings.data_sources": "แหล่งข้อมูล",
    "settings.dashboard_pages": "หน้าแดชบอร์ด",
    "settings.infrastructure": "โครงสร้างระบบ",
    "settings.auto_refresh": "รีเฟรชอัตโนมัติ",
    "settings.alert_thresholds": "เกณฑ์การแจ้งเตือน",
    "settings.low_stock_threshold": "สต็อกต่ำ (ชิ้น)",
    "settings.debt_warning": "หนี้เตือน (บาท)",
    "settings.debt_danger": "หนี้อันตราย (บาท)",
    "settings.credit_warning": "ลูกหนี้เตือน (บาท)",
    "settings.credit_danger": "ลูกหนี้อันตราย (บาท)",
    "settings.wage_budget_warning": "งบค่าแรงเตือน (%)",
    "settings.wage_budget_danger": "งบค่าแรงอันตราย (%)",

    // Financial
    "financial.savings": "เงินเก็บ",
    "financial.supplier_debt": "หนี้ supplier",
    "financial.receivables": "ลูกหนี้",
    "financial.wage_budget": "งบค่าแรง",
    "financial.safe": "ปลอดภัย",
    "financial.caution": "ระวัง",
    "financial.danger": "อันตราย",
    "financial.covers_days": "ครอบคลุม {days} วัน",
    "financial.persons": "ราย",

    // Branch comparison
    "compare.title": "เปรียบเทียบสาขา",
    "compare.subtitle": "เทียบผลประกอบการระหว่างสาขา",
    "compare.total_income": "รวมรายรับ",
    "compare.total_expense": "รวมรายจ่าย",
    "compare.total_profit": "รวมกำไร",
    "compare.avg_margin": "มาร์จิ้นเฉลี่ย",
    "compare.ranking": "อันดับสาขา",
    "compare.daily_trend": "แนวโน้มรายวัน",
    "compare.branch": "สาขา",
    "compare.income": "รายรับ",
    "compare.expense": "รายจ่าย",
    "compare.profit": "กำไร",
    "compare.margin": "มาร์จิ้น",
    "compare.share": "สัดส่วน",
  },
  en: {
    // Navigation
    "nav.menu": "Menu",
    "nav.overview": "Overview",
    "nav.alerts": "Alerts",
    "nav.shop": "Shop",
    "nav.calendar": "Calendar",
    "nav.pnl": "P&L",
    "nav.inventory": "Inventory",
    "nav.analytics": "Analytics",
    "nav.employees": "Employees",
    "nav.payables": "Payables",
    "nav.credits": "Credits",
    "nav.savings": "Savings",
    "nav.market": "Market",
    "nav.stocks": "Stocks",
    "nav.news": "News",
    "nav.system": "System",
    "nav.settings": "Settings",
    "nav.compare": "Compare Branches",

    // Common
    "common.refresh": "Refresh",
    "common.loading": "Loading...",
    "common.retry": "Retry",
    "common.export_csv": "Export CSV",
    "common.export_pdf": "Export PDF",
    "common.search": "Search...",
    "common.no_data": "No data",
    "common.baht": "THB",
    "common.days": "days",
    "common.error": "Error",
    "common.close": "Close",

    // Dashboard
    "dashboard.title": "ThaichaiRat Dashboard",
    "dashboard.hello": "Hello, Owner",
    "dashboard.income": "Income",
    "dashboard.expense": "Expense",
    "dashboard.profit_today": "Today's Profit",
    "dashboard.margin": "Margin",
    "dashboard.profit_month": "Monthly Profit",
    "dashboard.trend_summary": "Trend Summary",
    "dashboard.financial_health": "Financial Health",
    "dashboard.branch_performance": "Branch Performance",
    "dashboard.tracked_stocks": "Tracked Stocks",
    "dashboard.market_prices": "Market Prices",
    "dashboard.this_week": "This Week",
    "dashboard.this_month": "This Month",
    "dashboard.vs_last_week": "vs last week",
    "dashboard.vs_last_month": "vs last month",
    "dashboard.issues_to_check": "issues to review",
    "dashboard.critical": "critical",
    "dashboard.no_connection": "Cannot connect to server",

    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "System settings and information",
    "settings.theme": "Theme",
    "settings.theme_dark": "Dark",
    "settings.theme_light": "Light",
    "settings.theme_system": "System",
    "settings.language": "Language",
    "settings.refresh_interval": "Refresh Interval",
    "settings.server_status": "Server Status",
    "settings.online": "Online",
    "settings.offline": "Offline",
    "settings.test": "Test",
    "settings.data_sources": "Data Sources",
    "settings.dashboard_pages": "Dashboard Pages",
    "settings.infrastructure": "Infrastructure",
    "settings.auto_refresh": "Auto Refresh",
    "settings.alert_thresholds": "Alert Thresholds",
    "settings.low_stock_threshold": "Low Stock (items)",
    "settings.debt_warning": "Debt Warning (THB)",
    "settings.debt_danger": "Debt Danger (THB)",
    "settings.credit_warning": "Credit Warning (THB)",
    "settings.credit_danger": "Credit Danger (THB)",
    "settings.wage_budget_warning": "Wage Budget Warning (%)",
    "settings.wage_budget_danger": "Wage Budget Danger (%)",

    // Financial
    "financial.savings": "Savings",
    "financial.supplier_debt": "Supplier Debt",
    "financial.receivables": "Receivables",
    "financial.wage_budget": "Wage Budget",
    "financial.safe": "Safe",
    "financial.caution": "Caution",
    "financial.danger": "Danger",
    "financial.covers_days": "Covers {days} days",
    "financial.persons": "persons",

    // Branch comparison
    "compare.title": "Branch Comparison",
    "compare.subtitle": "Compare performance between branches",
    "compare.total_income": "Total Income",
    "compare.total_expense": "Total Expense",
    "compare.total_profit": "Total Profit",
    "compare.avg_margin": "Avg Margin",
    "compare.ranking": "Branch Ranking",
    "compare.daily_trend": "Daily Trend",
    "compare.branch": "Branch",
    "compare.income": "Income",
    "compare.expense": "Expense",
    "compare.profit": "Profit",
    "compare.margin": "Margin",
    "compare.share": "Share",
  },
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextType>({
  locale: "th",
  setLocale: () => {},
  t: (key) => key,
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("th")

  useEffect(() => {
    const saved = localStorage.getItem("dashboard-locale") as Locale | null
    if (saved && (saved === "th" || saved === "en")) setLocaleState(saved)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem("dashboard-locale", l)
    document.documentElement.lang = l
  }, [])

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      let str = translations[locale]?.[key] || translations.th[key] || key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v))
        }
      }
      return str
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
