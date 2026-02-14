"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"
import { setPin, setUnlocked } from "@/lib/pin-utils"

interface PinSetupDialogProps {
  onComplete: () => void
}

export function PinSetupDialog({ onComplete }: PinSetupDialogProps) {
  const [pin, setPinValue] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length < 4) {
      setError("PIN ต้องมีอย่างน้อย 4 หลัก")
      return
    }
    if (pin !== confirm) {
      setError("PIN ไม่ตรงกัน")
      setConfirm("")
      return
    }
    setLoading(true)
    await setPin(pin)
    setUnlocked()
    onComplete()
    setLoading(false)
  }

  function handleSkip() {
    setUnlocked()
    onComplete()
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <ShieldCheck className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
          <CardTitle>ตั้ง PIN ข้อมูลส่วนตัว</CardTitle>
          <p className="text-sm text-muted-foreground">
            ตั้ง PIN 4-6 หลัก เพื่อป้องกันข้อมูล
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">PIN ใหม่</label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="4-6 หลัก"
                value={pin}
                onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                className="text-center text-xl tracking-[0.5em]"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">ยืนยัน PIN</label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                placeholder="ใส่อีกครั้ง"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
                className="text-center text-xl tracking-[0.5em]"
              />
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading || pin.length < 4}>
              {loading ? "กำลังตั้งค่า..." : "ตั้ง PIN"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" onClick={handleSkip}>
              ข้ามไปก่อน
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
