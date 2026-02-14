"use client"

import { useTheme } from "@/lib/theme-context"
import { Sun, Moon, Monitor } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const next = () => {
    const order = ["dark", "light", "system"] as const
    const idx = order.indexOf(theme)
    setTheme(order[(idx + 1) % order.length])
  }

  return (
    <button
      onClick={next}
      className="flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      aria-label={`ธีม: ${theme === "dark" ? "มืด" : theme === "light" ? "สว่าง" : "ตามระบบ"}`}
      title={`ธีม: ${theme === "dark" ? "มืด" : theme === "light" ? "สว่าง" : "ตามระบบ"}`}
    >
      {theme === "dark" && <Moon className="h-4 w-4" />}
      {theme === "light" && <Sun className="h-4 w-4" />}
      {theme === "system" && <Monitor className="h-4 w-4" />}
    </button>
  )
}
