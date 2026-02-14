"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Gem } from "lucide-react"
import { SavingsGoalCard } from "@/components/personal/savings-goal-card"
import {
  getSavingsGoals,
  addSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
} from "@/lib/personal-api"
import type { PersonalSavingsGoal } from "@/lib/personal-types"

export default function SavingsPage() {
  const [goals, setGoals] = useState<PersonalSavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [target, setTarget] = useState("")
  const [deadline, setDeadline] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSavingsGoals()
      setGoals(data)
    } catch (e) {
      console.error("Failed to load savings goals:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd() {
    if (!name || !target) return
    await addSavingsGoal({
      name,
      target_amount: parseFloat(target),
      current_amount: 0,
      deadline: deadline || null,
    })
    setName(""); setTarget(""); setDeadline("")
    setDialogOpen(false)
    load()
  }

  async function handleAddMoney(id: number, amount: number) {
    const goal = goals.find((g) => g.id === id)
    if (!goal) return
    await updateSavingsGoal(id, {
      current_amount: Number(goal.current_amount) + amount,
    })
    load()
  }

  async function handleDelete(id: number) {
    await deleteSavingsGoal(id)
    load()
  }

  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0)
  const totalCurrent = goals.reduce((s, g) => s + Number(g.current_amount), 0)
  const overallProgress = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0
  const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Gem className="h-6 w-6" />
          <h1 className="text-2xl font-bold">เป้าหมายออม</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> เพิ่มเป้าหมาย
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มเป้าหมายออมเงิน</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="ชื่อเป้าหมาย เช่น กองทุนฉุกเฉิน" value={name} onChange={(e) => setName(e.target.value)} />
              <Input type="number" min="0" placeholder="เป้าหมาย (บาท)" value={target} onChange={(e) => setTarget(e.target.value)} />
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">กำหนด (ไม่บังคับ)</label>
                <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <Button onClick={handleAdd} disabled={!name || !target} className="w-full">สร้างเป้าหมาย</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <>
          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">ออมรวม</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{fmt(totalCurrent)} ฿</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">เป้าหมายรวม</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{fmt(totalTarget)} ฿</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">ความคืบหน้า</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{overallProgress}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Goal Cards */}
          {goals.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                ยังไม่มีเป้าหมาย — กด &quot;เพิ่มเป้าหมาย&quot; เพื่อเริ่มต้น
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  onAddMoney={handleAddMoney}
                  onEdit={async (id, updates) => {
                    await updateSavingsGoal(id, updates)
                    load()
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
