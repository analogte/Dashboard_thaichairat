"use client"

import { memo } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MonitorProvider } from "@/lib/monitor-context"
import { ThemeToggle } from "@/components/theme-toggle"

const DashboardHeader = memo(function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <span className="text-sm font-medium text-muted-foreground">Life Dashboard</span>
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  )
})

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MonitorProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </MonitorProvider>
  )
}
