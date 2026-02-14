"use client"

import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart } from "lucide-react"
import { getHealthRecords, upsertHealth } from "@/lib/personal-api"
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

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const startDate = thirtyDaysAgo.toISOString().split("T")[0]

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getHealthRecords(startDate, today)
      setRecords(data)

      // pre-fill if today exists
      const todayRecord = data.find((r) => r.date === today)
      if (todayRecord) {
        setWeight(todayRecord.weight?.toString() || "")
        setBpSys(todayRecord.blood_pressure_sys?.toString() || "")
        setBpDia(todayRecord.blood_pressure_dia?.toString() || "")
        setSugar(todayRecord.blood_sugar?.toString() || "")
        setSleep(todayRecord.sleep_hours?.toString() || "")
        setNote(todayRecord.note || "")
      }
    } catch (e) {
      console.error("Failed to load health:", e)
    } finally {
      setLoading(false)
    }
  }, [startDate, today])

  useEffect(() => { load() }, [load])

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
          <CardTitle>บันทึกสุขภาพ</CardTitle>
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
              {saving ? "กำลังบันทึก..." : "บันทึก"}
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
        </>
      )}
    </div>
  )
}
