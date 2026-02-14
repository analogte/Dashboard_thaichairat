"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { verifyPin, setUnlocked } from "@/lib/pin-utils"

interface PinLockProps {
  onUnlock: () => void
}

export function PinLock({ onUnlock }: PinLockProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length < 4) return
    setLoading(true)
    setError("")
    const ok = await verifyPin(pin)
    if (ok) {
      setUnlocked()
      onUnlock()
    } else {
      setError("PIN ไม่ถูกต้อง")
      setPin("")
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Lock className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <CardTitle>ข้อมูลส่วนตัว</CardTitle>
          <p className="text-sm text-muted-foreground">กรุณาใส่ PIN เพื่อเข้าถึง</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              inputMode="numeric"
              maxLength={6}
              placeholder="PIN (4-6 หลัก)"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-[0.5em]"
              autoFocus
            />
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || pin.length < 4}>
              {loading ? "กำลังตรวจสอบ..." : "ปลดล็อก"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
