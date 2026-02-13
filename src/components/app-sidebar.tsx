"use client"

import * as React from "react"
import {
  BarChart3,
  Newspaper,
  Settings,
  ShoppingBasket,
  Store,
  TrendingUp,
  Leaf,
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
    email: "owner",
    avatar: "",
  },
  teams: [
    {
      name: "ThaichaiRat",
      logo: Leaf,
      plan: "Shop Dashboard",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChart3,
      isActive: true,
    },
    {
      title: "Shop",
      url: "/dashboard/shop",
      icon: Store,
    },
    {
      title: "Market Prices",
      url: "/dashboard/market",
      icon: ShoppingBasket,
    },
    {
      title: "Stocks",
      url: "/dashboard/stocks",
      icon: TrendingUp,
    },
    {
      title: "News",
      url: "/dashboard/news",
      icon: Newspaper,
    },
    {
      title: "Settings",
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
