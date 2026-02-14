"use client"

import { useCallback, useEffect, useRef, useState } from "react"
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
import { RoutineChecklist } from "@/components/personal/routine-checklist"
import { RoutineHeatmap } from "@/components/personal/routine-heatmap"
import {
  getRoutines,
  getRoutinesRange,
  upsertRoutine,
  getTemplates,
  addTemplate,
  deleteTemplate,
  toThaiDate,
} from "@/lib/personal-api"
import type { PersonalRoutine, RoutineTemplate } from "@/lib/personal-types"
import { Plus, Trash2 } from "lucide-react"

export default function RoutinePage() {
  const today = new Date().toISOString().split("T")[0]
  const [templates, setTemplates] = useState<RoutineTemplate[]>([])
  const [routines, setRoutines] = useState<PersonalRoutine[]>([])
  const [rangeRoutines, setRangeRoutines] = useState<PersonalRoutine[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newActivity, setNewActivity] = useState("")
  const [newIcon, setNewIcon] = useState("")
  const [newUnit, setNewUnit] = useState("")
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [tmpl, todayR] = await Promise.all([
        getTemplates(),
        getRoutines(today),
      ])
      setTemplates(tmpl)
      setRoutines(todayR)

      // load 4 weeks for heatmap
      const fourWeeksAgo = new Date()
      fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
      const rangeR = await getRoutinesRange(
        fourWeeksAgo.toISOString().split("T")[0],
        today
      )
      setRangeRoutines(rangeR)
    } catch (e) {
      console.error("Failed to load routines:", e)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    load()
  }, [load])

  async function handleToggle(activity: string, done: boolean) {
    // optimistic update
    setRoutines((prev) => {
      const existing = prev.find((r) => r.activity === activity)
      if (existing) {
        return prev.map((r) =>
          r.activity === activity ? { ...r, done } : r
        )
      }
      return [
        ...prev,
        {
          id: 0,
          date: today,
          activity,
          value: "",
          done,
          note: "",
          created_at: "",
        },
      ]
    })
    await upsertRoutine(today, activity, done)
  }

  function handleValueChange(activity: string, value: string) {
    // optimistic update
    setRoutines((prev) => {
      const existing = prev.find((r) => r.activity === activity)
      if (existing) {
        return prev.map((r) =>
          r.activity === activity ? { ...r, value } : r
        )
      }
      return [
        ...prev,
        {
          id: 0,
          date: today,
          activity,
          value,
          done: false,
          note: "",
          created_at: "",
        },
      ]
    })

    // debounce save
    if (debounceRef.current[activity]) {
      clearTimeout(debounceRef.current[activity])
    }
    debounceRef.current[activity] = setTimeout(async () => {
      const r = routines.find((r) => r.activity === activity)
      await upsertRoutine(today, activity, r?.done ?? false, value)
    }, 500)
  }

  async function handleAddTemplate() {
    if (!newActivity.trim()) return
    await addTemplate(newActivity.trim(), newIcon.trim(), newUnit.trim())
    setNewActivity("")
    setNewIcon("")
    setNewUnit("")
    setDialogOpen(false)
    load()
  }

  async function handleDeleteTemplate(id: number) {
    await deleteTemplate(id)
    load()
  }

  // stats
  const doneCount = routines.filter((r) => r.done).length
  const completionRate =
    templates.length > 0
      ? Math.round((doneCount / templates.length) * 100)
      : 0

  // streak calc
  let streak = 0
  const checkDate = new Date()
  const allByDate = new Map<string, PersonalRoutine[]>()
  rangeRoutines.forEach((r) => {
    const existing = allByDate.get(r.date) || []
    existing.push(r)
    allByDate.set(r.date, existing)
  })

  // check if today is complete
  const todayComplete =
    templates.length > 0 && doneCount >= templates.length
  if (todayComplete) streak = 1

  // go backwards
  const startOffset = todayComplete ? 1 : 0
  for (let i = startOffset; i < 28; i++) {
    const d = new Date(checkDate)
    d.setDate(d.getDate() - (i + (todayComplete ? 0 : 1)))
    const dateStr = d.toISOString().split("T")[0]
    const dayRoutines = allByDate.get(dateStr) || []
    const dayDone = dayRoutines.filter((r) => r.done).length
    if (dayDone >= templates.length && templates.length > 0) {
      streak++
    } else {
      break
    }
  }

  // monthly stats
  const thisMonth = today.substring(0, 7)
  const monthRoutines = rangeRoutines.filter((r) =>
    r.date.startsWith(thisMonth)
  )
  const monthDays = new Set(monthRoutines.map((r) => r.date))
  const monthCompleteDays = [...monthDays].filter((date) => {
    const dayR = monthRoutines.filter((r) => r.date === date)
    return dayR.filter((r) => r.done).length >= templates.length
  }).length

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">ตารางชีวิต</h1>
        <p className="text-sm text-muted-foreground">{toThaiDate(today)}</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold text-green-600">{streak}</p>
                <p className="text-xs text-muted-foreground">Streak (วัน)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold">{completionRate}%</p>
                <p className="text-xs text-muted-foreground">วันนี้</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold">
                  {doneCount}/{templates.length}
                </p>
                <p className="text-xs text-muted-foreground">ทำแล้ว</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-3xl font-bold">{monthCompleteDays}</p>
                <p className="text-xs text-muted-foreground">วันครบเดือนนี้</p>
              </CardContent>
            </Card>
          </div>

          {/* Checklist */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>กิจวัตรวันนี้</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    เพิ่มกิจวัตร
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่มกิจวัตรใหม่</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-2">
                    <Input
                      placeholder="ชื่อกิจวัตร เช่น วิ่ง"
                      value={newActivity}
                      onChange={(e) => setNewActivity(e.target.value)}
                    />
                    <div className="flex gap-3">
                      <Input
                        placeholder="Icon เช่น 🏃"
                        value={newIcon}
                        onChange={(e) => setNewIcon(e.target.value)}
                        className="w-[100px]"
                      />
                      <Input
                        placeholder="หน่วย เช่น กม."
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleAddTemplate}
                      disabled={!newActivity.trim()}
                      className="w-full"
                    >
                      เพิ่ม
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {templates.length === 0 ? (
                <p className="text-muted-foreground">
                  ยังไม่มีกิจวัตร — กดปุ่ม &quot;เพิ่มกิจวัตร&quot;
                </p>
              ) : (
                <RoutineChecklist
                  templates={templates}
                  routines={routines}
                  onToggle={handleToggle}
                  onValueChange={handleValueChange}
                />
              )}
            </CardContent>
          </Card>

          {/* Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>ภาพรวม 4 สัปดาห์</CardTitle>
            </CardHeader>
            <CardContent>
              <RoutineHeatmap
                routines={rangeRoutines}
                templateCount={templates.length}
                weeks={4}
              />
            </CardContent>
          </Card>

          {/* Template Management */}
          <Card>
            <CardHeader>
              <CardTitle>จัดการกิจวัตร</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {templates.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.activity}</span>
                      {t.unit && (
                        <span className="text-xs text-muted-foreground">
                          ({t.unit})
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDeleteTemplate(t.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
