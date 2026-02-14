"use client"

import * as React from "react"
import {
  BarChart3,
  Bell,
  CalendarDays,
  Newspaper,
  Receipt,
  Settings,
  Store,
  TrendingUp,
  Leaf,
  ShoppingBasket,
  Package,
  PieChart,
  Users,
  CreditCard,
  HandCoins,
  Monitor,
  PiggyBank,
  GitCompareArrows,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useI18n } from "@/lib/i18n"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const NAV_ITEMS = [
  { i18nKey: "nav.overview", url: "/dashboard", icon: BarChart3, isActive: true },
  { i18nKey: "nav.alerts", url: "/dashboard/alerts", icon: Bell },
  { i18nKey: "nav.shop", url: "/dashboard/shop", icon: Store },
  { i18nKey: "nav.calendar", url: "/dashboard/calendar", icon: CalendarDays },
  { i18nKey: "nav.pnl", url: "/dashboard/pnl", icon: Receipt },
  { i18nKey: "nav.inventory", url: "/dashboard/inventory", icon: Package },
  { i18nKey: "nav.analytics", url: "/dashboard/analytics", icon: PieChart },
  { i18nKey: "nav.employees", url: "/dashboard/employees", icon: Users },
  { i18nKey: "nav.payables", url: "/dashboard/payables", icon: CreditCard },
  { i18nKey: "nav.credits", url: "/dashboard/credits", icon: HandCoins },
  { i18nKey: "nav.savings", url: "/dashboard/savings", icon: PiggyBank },
  { i18nKey: "nav.market", url: "/dashboard/market", icon: ShoppingBasket },
  { i18nKey: "nav.stocks", url: "/dashboard/stocks", icon: TrendingUp },
  { i18nKey: "nav.news", url: "/dashboard/news", icon: Newspaper },
  { i18nKey: "nav.compare", url: "/dashboard/compare", icon: GitCompareArrows },
  { i18nKey: "nav.system", url: "/dashboard/system", icon: Monitor },
  { i18nKey: "nav.settings", url: "/dashboard/settings", icon: Settings },
]

export const AppSidebar = React.memo(function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useI18n()

  const navItems = React.useMemo(
    () => NAV_ITEMS.map((item) => ({ ...item, title: t(item.i18nKey) })),
    [t],
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[{ name: "ไทยชัยรัตย์", logo: Leaf, plan: "แดชบอร์ดร้าน" }]} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: "Natthakorn", email: "เจ้าของ", avatar: "" }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
})
