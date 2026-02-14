"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/personal-types"

interface TransactionFormProps {
  onSubmit: (data: {
    date: string
    type: "income" | "expense"
    amount: number
    category: string
    note: string
  }) => Promise<void>
}

export function TransactionForm({ onSubmit }: TransactionFormProps) {
  const today = new Date().toISOString().split("T")[0]
  const [date, setDate] = useState(today)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !category) return
    setLoading(true)
    try {
      await onSubmit({
        date,
        type,
        amount: parseFloat(amount),
        category,
        note,
      })
      setAmount("")
      setNote("")
      setCategory("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">วันที่</label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-[150px]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">ประเภท</label>
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v as "income" | "expense")
            setCategory("")
          }}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="expense">รายจ่าย</SelectItem>
            <SelectItem value="income">รายรับ</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">จำนวน (บาท)</label>
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-[130px]"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">หมวด</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="เลือกหมวด" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">หมายเหตุ</label>
        <Input
          placeholder="(ไม่บังคับ)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-[160px]"
        />
      </div>
      <Button type="submit" disabled={loading || !amount || !category}>
        {loading ? "กำลังบันทึก..." : "บันทึก"}
      </Button>
    </form>
  )
}
