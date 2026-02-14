"use client"

import { useEffect, useState } from "react"
import { hasPin, isUnlocked } from "@/lib/pin-utils"
import { PinLock } from "@/components/personal/pin-lock"
import { PinSetupDialog } from "@/components/personal/pin-setup-dialog"

export default function PersonalLayout({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<"loading" | "setup" | "locked" | "unlocked">("loading")

  useEffect(() => {
    if (isUnlocked()) {
      setState("unlocked")
    } else if (hasPin()) {
      setState("locked")
    } else {
      setState("setup")
    }
  }, [])

  if (state === "loading") {
    return <div className="p-6 text-muted-foreground">กำลังโหลด...</div>
  }

  if (state === "setup") {
    return <PinSetupDialog onComplete={() => setState("unlocked")} />
  }

  if (state === "locked") {
    return <PinLock onUnlock={() => setState("unlocked")} />
  }

  return <>{children}</>
}
