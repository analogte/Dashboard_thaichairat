"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import { fetchMonitorData, type MonitorData } from "./api"

interface MonitorContextType {
  data: MonitorData | null
  loading: boolean
  refresh: () => Promise<void>
}

const MonitorContext = createContext<MonitorContextType>({
  data: null,
  loading: true,
  refresh: async () => {},
})

export function MonitorProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const d = await fetchMonitorData()
    setData(d)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refresh])

  return (
    <MonitorContext.Provider value={{ data, loading, refresh }}>
      {children}
    </MonitorContext.Provider>
  )
}

export function useMonitor() {
  return useContext(MonitorContext)
}
