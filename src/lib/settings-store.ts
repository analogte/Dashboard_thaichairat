"use client"

export interface AlertThresholds {
  lowStockMinItems: number
  debtWarning: number
  debtDanger: number
  creditWarning: number
  creditDanger: number
  wageBudgetWarning: number
  wageBudgetDanger: number
}

export interface DashboardSettings {
  refreshInterval: number // minutes
  alertThresholds: AlertThresholds
}

const STORAGE_KEY = "dashboard-settings"

const DEFAULT_SETTINGS: DashboardSettings = {
  refreshInterval: 5,
  alertThresholds: {
    lowStockMinItems: 5,
    debtWarning: 10000,
    debtDanger: 20000,
    creditWarning: 2000,
    creditDanger: 5000,
    wageBudgetWarning: 70,
    wageBudgetDanger: 90,
  },
}

export function loadSettings(): DashboardSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: DashboardSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function getDefaults(): DashboardSettings {
  return DEFAULT_SETTINGS
}
