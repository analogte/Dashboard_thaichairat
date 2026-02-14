"use client"

import { memo, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import { GlobalSearch } from "@/components/global-search"
import { ThemeToggle } from "@/components/theme-toggle"
import { ErrorBoundary } from "@/components/error-boundary"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { MonitorProvider } from "@/lib/monitor-context"

const DashboardHeader = memo(function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" aria-label="เปิด/ปิดเมนู" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
        แดชบอร์ด ไทยชัยรัตย์
      </span>
      <div className="flex-1" />
      <GlobalSearch />
      <ThemeToggle />
    </header>
  )
})

function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Service worker registration failed — ignore silently
      })
    }
  }, [])
  return null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MonitorProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </SidebarInset>
      </SidebarProvider>
      <ServiceWorkerRegistrar />
    </MonitorProvider>
  )
}
