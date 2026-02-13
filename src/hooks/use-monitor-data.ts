"use client"

import { useEffect, useState, useCallback } from "react"
import { fetchMonitorData, type MonitorData } from "@/lib/api"

export function useMonitorData(autoRefreshMs?: number) {
  const [data, setData] = useState<MonitorData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const d = await fetchMonitorData()
    setData(d)
    setLoading(false)
  }, [])

  useEffect(() => {
    let cancelled = false
    fetchMonitorData().then((d) => {
      if (!cancelled) {
        setData(d)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (autoRefreshMs && autoRefreshMs > 0) {
      const interval = setInterval(() => {
        fetchMonitorData().then((d) => {
          setData(d)
        })
      }, autoRefreshMs)
      return () => clearInterval(interval)
    }
  }, [autoRefreshMs])

  return { data, loading, refresh: load }
}
