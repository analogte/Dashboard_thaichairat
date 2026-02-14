"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react"
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
  const lastHash = useRef("")
  const hasLoaded = useRef(false)

  const refresh = useCallback(async () => {
    // Only show loading spinner on first load
    if (!hasLoaded.current) {
      setLoading(true)
    }
    try {
      const d = await fetchMonitorData()
      if (d) {
        const hash = d.updated_at
        if (hash !== lastHash.current) {
          lastHash.current = hash
          setData(d)
        }
      }
    } finally {
      if (!hasLoaded.current) {
        hasLoaded.current = true
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refresh])

  const value = useMemo(
    () => ({ data, loading, refresh }),
    [data, loading, refresh]
  )

  return (
    <MonitorContext.Provider value={value}>
      {children}
    </MonitorContext.Provider>
  )
}

export function useMonitor() {
  return useContext(MonitorContext)
}
