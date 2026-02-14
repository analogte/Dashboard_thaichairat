"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useMonitor } from "@/lib/monitor-context"
import {
  Search,
  BarChart3,
  Bell,
  Store,
  CalendarDays,
  Receipt,
  Package,
  PieChart,
  Users,
  CreditCard,
  HandCoins,
  PiggyBank,
  ShoppingBasket,
  TrendingUp,
  Newspaper,
  Monitor,
  Settings,
  GitCompareArrows,
  X,
} from "lucide-react"

interface SearchItem {
  label: string
  description: string
  url: string
  icon: React.ReactNode
  category: "page" | "product" | "employee" | "supplier" | "customer"
}

const PAGES: SearchItem[] = [
  { label: "ภาพรวม", description: "หน้าหลัก Dashboard", url: "/dashboard", icon: <BarChart3 className="h-4 w-4" />, category: "page" },
  { label: "แจ้งเตือน", description: "ศูนย์แจ้งเตือน", url: "/dashboard/alerts", icon: <Bell className="h-4 w-4" />, category: "page" },
  { label: "ร้านค้า", description: "ยอดขายรายวัน", url: "/dashboard/shop", icon: <Store className="h-4 w-4" />, category: "page" },
  { label: "ปฏิทินร้าน", description: "ปฏิทินยอดขาย", url: "/dashboard/calendar", icon: <CalendarDays className="h-4 w-4" />, category: "page" },
  { label: "กำไรขาดทุน", description: "P&L รายเดือน", url: "/dashboard/pnl", icon: <Receipt className="h-4 w-4" />, category: "page" },
  { label: "สต็อก", description: "จัดการสต็อกสินค้า", url: "/dashboard/inventory", icon: <Package className="h-4 w-4" />, category: "page" },
  { label: "วิเคราะห์สินค้า", description: "สินค้าขายดี / รับเข้า", url: "/dashboard/analytics", icon: <PieChart className="h-4 w-4" />, category: "page" },
  { label: "พนักงาน", description: "จัดการพนักงาน", url: "/dashboard/employees", icon: <Users className="h-4 w-4" />, category: "page" },
  { label: "หนี้ค้างชำระ", description: "หนี้ supplier", url: "/dashboard/payables", icon: <CreditCard className="h-4 w-4" />, category: "page" },
  { label: "ลูกหนี้", description: "ลูกหนี้ค้างชำระ", url: "/dashboard/credits", icon: <HandCoins className="h-4 w-4" />, category: "page" },
  { label: "เงินเก็บ", description: "เงินสำรอง", url: "/dashboard/savings", icon: <PiggyBank className="h-4 w-4" />, category: "page" },
  { label: "ราคาตลาด", description: "ราคาสินค้าตลาด", url: "/dashboard/market", icon: <ShoppingBasket className="h-4 w-4" />, category: "page" },
  { label: "หุ้น", description: "ติดตามหุ้น", url: "/dashboard/stocks", icon: <TrendingUp className="h-4 w-4" />, category: "page" },
  { label: "ข่าวสาร", description: "ข่าวธุรกิจ", url: "/dashboard/news", icon: <Newspaper className="h-4 w-4" />, category: "page" },
  { label: "ระบบ", description: "สถานะเซิร์ฟเวอร์", url: "/dashboard/system", icon: <Monitor className="h-4 w-4" />, category: "page" },
  { label: "ตั้งค่า", description: "ตั้งค่าระบบ", url: "/dashboard/settings", icon: <Settings className="h-4 w-4" />, category: "page" },
  { label: "เปรียบเทียบสาขา", description: "เทียบสาขา", url: "/dashboard/compare", icon: <GitCompareArrows className="h-4 w-4" />, category: "page" },
]

const CATEGORY_LABELS: Record<string, string> = {
  page: "หน้า",
  product: "สินค้า",
  employee: "พนักงาน",
  supplier: "Supplier",
  customer: "ลูกค้า",
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { data } = useMonitor()

  // Build dynamic search items from data
  const dynamicItems = useMemo<SearchItem[]>(() => {
    if (!data) return []
    const items: SearchItem[] = []

    // Products from inventory
    if (data.inventory?.items) {
      for (const item of data.inventory.items) {
        items.push({
          label: item.product,
          description: `${item.quantity} ${item.unit} | ${item.category}`,
          url: "/dashboard/inventory",
          icon: <Package className="h-4 w-4" />,
          category: "product",
        })
      }
    }

    // Employees
    if (data.shop_history?.employees) {
      for (const emp of data.shop_history.employees) {
        items.push({
          label: emp.name,
          description: `${emp.type} | ${emp.shift}`,
          url: "/dashboard/employees",
          icon: <Users className="h-4 w-4" />,
          category: "employee",
        })
      }
    }

    // Suppliers
    if (data.payables_data?.suppliers) {
      for (const s of data.payables_data.suppliers) {
        items.push({
          label: s.supplier,
          description: `ค้างชำระ ${s.balance.toLocaleString("th-TH")} บาท`,
          url: "/dashboard/payables",
          icon: <CreditCard className="h-4 w-4" />,
          category: "supplier",
        })
      }
    }

    // Customers
    if (data.credits_data?.customers) {
      for (const c of data.credits_data.customers) {
        items.push({
          label: c.customer,
          description: `ค้างชำระ ${c.balance.toLocaleString("th-TH")} บาท`,
          url: "/dashboard/credits",
          icon: <HandCoins className="h-4 w-4" />,
          category: "customer",
        })
      }
    }

    return items
  }, [data])

  const allItems = useMemo(() => [...PAGES, ...dynamicItems], [dynamicItems])

  const filtered = useMemo(() => {
    if (!query.trim()) return PAGES.slice(0, 8) // Show pages by default
    const q = query.toLowerCase()
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    ).slice(0, 12)
  }, [query, allItems])

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filtered])

  // Keyboard shortcut to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleSelect = useCallback(
    (item: SearchItem) => {
      setOpen(false)
      router.push(item.url)
    },
    [router],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault()
        handleSelect(filtered[selectedIndex])
      }
    },
    [filtered, selectedIndex, handleSelect],
  )

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.children[selectedIndex] as HTMLElement
      selected?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
        aria-label="ค้นหา"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline">ค้นหา...</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 rounded border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    )
  }

  // Group by category
  const grouped = new Map<string, SearchItem[]>()
  for (const item of filtered) {
    const group = grouped.get(item.category) || []
    group.push(item)
    grouped.set(item.category, group)
  }

  let globalIndex = 0

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-xl border bg-popover shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ค้นหาหน้า, สินค้า, พนักงาน..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            role="combobox"
            aria-expanded={true}
            aria-controls="search-results"
            aria-activedescendant={`search-item-${selectedIndex}`}
          />
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="ปิด">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div
          id="search-results"
          ref={listRef}
          className="max-h-[300px] overflow-y-auto p-2"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">ไม่พบผลลัพธ์</p>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category}>
                <p className="text-xs text-muted-foreground px-2 py-1.5 font-medium">
                  {CATEGORY_LABELS[category] || category}
                </p>
                {items.map((item) => {
                  const idx = globalIndex++
                  return (
                    <button
                      key={`${item.category}-${item.label}-${idx}`}
                      id={`search-item-${idx}`}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3 w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        idx === selectedIndex ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent/50"
                      }`}
                      role="option"
                      aria-selected={idx === selectedIndex}
                    >
                      <span className="text-muted-foreground shrink-0">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{item.description}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">↑↓</kbd>
            <span>เลื่อน</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">↵</kbd>
            <span>เปิด</span>
          </div>
          <div>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono">Esc</kbd>
            <span className="ml-1">ปิด</span>
          </div>
        </div>
      </div>
    </>
  )
}
