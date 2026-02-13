"use client"

import * as React from "react"
import {
  BarChart3,
  Bell,
  Newspaper,
  Receipt,
  Settings,
  Store,
  TrendingUp,
  Leaf,
  ShoppingBasket,
  Package,
  Users,
  CreditCard,
  HandCoins,
  Monitor,
  PiggyBank,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Natthakorn",
    email: "เจ้าของ",
    avatar: "",
  },
  teams: [
    {
      name: "ไทยชัยรัตย์",
      logo: Leaf,
      plan: "แดชบอร์ดร้าน",
    },
  ],
  navMain: [
    {
      title: "ภาพรวม",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "แจ้งเตือน",
      url: "/dashboard/alerts",
      icon: Bell,
    },
    {
      title: "ร้านค้า",
      url: "/dashboard/shop",
      icon: Store,
    },
    {
      title: "กำไรขาดทุน",
      url: "/dashboard/pnl",
      icon: Receipt,
    },
    {
      title: "สต็อก",
      url: "/dashboard/inventory",
      icon: Package,
    },
    {
      title: "พนักงาน",
      url: "/dashboard/employees",
      icon: Users,
    },
    {
      title: "หนี้ค้างชำระ",
      url: "/dashboard/payables",
      icon: CreditCard,
    },
    {
      title: "ลูกหนี้",
      url: "/dashboard/credits",
      icon: HandCoins,
    },
    {
      title: "เงินเก็บ",
      url: "/dashboard/savings",
      icon: PiggyBank,
    },
    {
      title: "ราคาตลาด",
      url: "/dashboard/market",
      icon: ShoppingBasket,
    },
    {
      title: "หุ้น",
      url: "/dashboard/stocks",
      icon: TrendingUp,
    },
    {
      title: "ข่าวสาร",
      url: "/dashboard/news",
      icon: Newspaper,
    },
    {
      title: "ระบบ",
      url: "/dashboard/system",
      icon: Monitor,
    },
    {
      title: "ตั้งค่า",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
