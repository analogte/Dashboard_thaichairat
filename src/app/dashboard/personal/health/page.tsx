"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Pencil, Trash2 } from "lucide-react"
import { getHealthRecords, upsertHealth, deleteHealth, toThaiDate } from "@/lib/personal-api"
import type { PersonalHealth } from "@/lib/personal-types"

const HealthChart = dynamic(
  () => import("@/components/personal/health-chart").then((m) => m.HealthChart),
  { ssr: false, loading: () => <div className="h-[200px]" /> }
)

export default function HealthPage() {
  const today = new Date().toISOString().split("T")[0]
  const [records, setRecords] = useState<PersonalHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // form state
  const [date, setDate] = useState(today)
  const [weight, setWeight] = useState("")
  const [bpSys, setBpSys] = useState("")
  const [bpDia, setBpDia] = useState("")
  const [sugar, setSugar] = useState("")
  const [sleep, setSleep] = useState("")
  const [note, setNote] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const startDate = thirtyDaysAgo.toISOString().split("T")[0]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getHealthRecords(startDate, today)
      setRecords(data)
    } catch (e) {
      console.error("Failed to load health:", e)
    } finally {
      setLoading(false)
    }
  }, [startDate, today])

  useEffect(() => { load() }, [load])

  function fillForm(r: PersonalHealth) {
    setDate(r.date)
    setWeight(r.weight?.toString() || "")
    setBpSys(r.blood_pressure_sys?.toString() || "")
    setBpDia(r.blood_pressure_dia?.toString() || "")
    setSugar(r.blood_sugar?.toString() || "")
    setSleep(r.sleep_hours?.toString() || "")
    setNote(r.note || "")
    setEditingId(r.id)
  }

  function resetForm() {
    setDate(today)
    setWeight(""); setBpSys(""); setBpDia(""); setSugar(""); setSleep(""); setNote("")
    setEditingId(null)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await upsertHealth({
      date,
      weight: weight ? parseFloat(weight) : null,
      blood_pressure_sys: bpSys ? parseInt(bpSys) : null,
      blood_pressure_dia: bpDia ? parseInt(bpDia) : null,
      blood_sugar: sugar ? parseFloat(sugar) : null,
      sleep_hours: sleep ? parseFloat(sleep) : null,
      note,
    })
    setSaving(false)
    resetForm()
    load()
  }

  async function handleDelete(id: number) {
    await deleteHealth(id)
    if (editingId === id) resetForm()
    load()
  }

  // latest record
  const latest = records.length > 0 ? records[records.length - 1] : null

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Heart className="h-6 w-6" />
        <h1 className="text-2xl font-bold">สุขภาพ</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{latest?.weight ?? "-"}</p>
            <p className="text-xs text-muted-foreground">น้ำหนัก (กก.)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">
              {latest?.blood_pressure_sys && latest?.blood_pressure_dia
                ? `${latest.blood_pressure_sys}/${latest.blood_pressure_dia}`
                : "-"}
            </p>
            <p className="text-xs text-muted-foreground">ความดัน</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{latest?.blood_sugar ?? "-"}</p>
            <p className="text-xs text-muted-foreground">น้ำตาล (mg/dL)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{latest?.sleep_hours ?? "-"}</p>
            <p className="text-xs text-muted-foreground">นอน (ชม.)</p>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{editingId ? "แก้ไขข้อมูลสุขภาพ" : "บันทึกสุขภาพ"}</CardTitle>
            {editingId && (
              <Button variant="ghost" size="sm" onClick={resetForm}>ยกเลิกแก้ไข</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">วันที่</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-[150px]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">น้ำหนัก (กก.)</label>
              <Input type="number" step="0.1" placeholder="0.0" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-[100px]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">ความดัน</label>
              <div className="flex gap-1 items-center">
                <Input type="number" placeholder="SYS" value={bpSys} onChange={(e) => setBpSys(e.target.value)} className="w-[70px]" />
                <span>/</span>
                <Input type="number" placeholder="DIA" value={bpDia} onChange={(e) => setBpDia(e.target.value)} className="w-[70px]" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">น้ำตาล</label>
              <Input type="number" step="0.1" placeholder="mg/dL" value={sugar} onChange={(e) => setSugar(e.target.value)} className="w-[100px]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">นอน (ชม.)</label>
              <Input type="number" step="0.5" placeholder="0" value={sleep} onChange={(e) => setSleep(e.target.value)} className="w-[80px]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">หมายเหตุ</label>
              <Input placeholder="(ไม่บังคับ)" value={note} onChange={(e) => setNote(e.target.value)} className="w-[150px]" />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "กำลังบันทึก..." : editingId ? "อัปเดต" : "บันทึก"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-base">น้ำหนัก 30 วัน</CardTitle></CardHeader>
              <CardContent>
                <HealthChart
                  data={records.map((r) => ({ date: r.date, value: r.weight }))}
                  label="น้ำหนัก" color="#3b82f6" unit="กก."
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">การนอน 30 วัน</CardTitle></CardHeader>
              <CardContent>
                <HealthChart
                  data={records.map((r) => ({ date: r.date, value: r.sleep_hours }))}
                  label="ชั่วโมงนอน" color="#8b5cf6" unit="ชม."
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">ความดัน (Systolic) 30 วัน</CardTitle></CardHeader>
              <CardContent>
                <HealthChart
                  data={records.map((r) => ({ date: r.date, value: r.blood_pressure_sys }))}
                  label="ความดัน" color="#ef4444" unit="mmHg"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">น้ำตาล 30 วัน</CardTitle></CardHeader>
              <CardContent>
                <HealthChart
                  data={records.map((r) => ({ date: r.date, value: r.blood_sugar }))}
                  label="น้ำตาล" color="#f59e0b" unit="mg/dL"
                />
              </CardContent>
            </Card>
          </div>

          {/* Records Table */}
          {records.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">ประวัติสุขภาพ ({records.length} วัน)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-3">วันที่</th>
                        <th className="py-2 pr-3 text-right">น้ำหนัก</th>
                        <th className="py-2 pr-3 text-right">ความดัน</th>
                        <th className="py-2 pr-3 text-right">น้ำตาล</th>
                        <th className="py-2 pr-3 text-right">นอน</th>
                        <th className="py-2 pr-3">หมายเหตุ</th>
                        <th className="py-2 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...records].reverse().map((r) => (
                        <tr key={r.id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-2 pr-3">{toThaiDate(r.date)}</td>
                          <td className="py-2 pr-3 text-right">{r.weight ?? "-"}</td>
                          <td className="py-2 pr-3 text-right">
                            {r.blood_pressure_sys && r.blood_pressure_dia
                              ? `${r.blood_pressure_sys}/${r.blood_pressure_dia}`
                              : "-"}
                          </td>
                          <td className="py-2 pr-3 text-right">{r.blood_sugar ?? "-"}</td>
                          <td className="py-2 pr-3 text-right">{r.sleep_hours ?? "-"}</td>
                          <td className="py-2 pr-3 text-muted-foreground">{r.note || "-"}</td>
                          <td className="py-2 whitespace-nowrap">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-blue-500"
                              onClick={() => fillForm(r)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500"
                              onClick={() => handleDelete(r.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
