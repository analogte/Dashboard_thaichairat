"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, X } from "lucide-react"
import { getFavorites, addFavorite, deleteFavorite } from "@/lib/personal-api"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/personal-types"
import type { PersonalFavorite } from "@/lib/personal-types"

interface FavoritesBarProps {
  onQuickAdd: (data: {
    type: "income" | "expense"
    amount: number
    category: string
    note: string
  }) => Promise<void>
}

export function FavoritesBar({ onQuickAdd }: FavoritesBarProps) {
  const [favorites, setFavorites] = useState<PersonalFavorite[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")

  const load = useCallback(async () => {
    const data = await getFavorites()
    setFavorites(data)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAddFavorite() {
    if (!name || !amount || !category) return
    await addFavorite({ name, type, amount: parseFloat(amount), category })
    setName(""); setAmount(""); setCategory("")
    setDialogOpen(false)
    load()
  }

  async function handleQuickAdd(fav: PersonalFavorite) {
    await onQuickAdd({
      type: fav.type,
      amount: Number(fav.amount),
      category: fav.category,
      note: fav.name,
    })
  }

  async function handleDelete(e: React.MouseEvent, id: number) {
    e.stopPropagation()
    await deleteFavorite(id)
    load()
  }

  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  if (favorites.length === 0 && !dialogOpen) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">บันทึกด่วน:</span>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-3 w-3 mr-1" /> เพิ่มรายการโปรด
            </Button>
          </DialogTrigger>
          <FavoriteFormDialog
            name={name} setName={setName}
            type={type} setType={setType}
            amount={amount} setAmount={setAmount}
            category={category} setCategory={setCategory}
            categories={categories}
            onSubmit={handleAddFavorite}
          />
        </Dialog>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">บันทึกด่วน:</span>
      {favorites.map((fav) => (
        <Button
          key={fav.id}
          variant="outline"
          size="sm"
          className="group relative"
          onClick={() => handleQuickAdd(fav)}
        >
          <span className={fav.type === "income" ? "text-green-600" : "text-red-500"}>
            {fav.type === "income" ? "+" : "-"}{Number(fav.amount).toLocaleString()}
          </span>
          <span className="ml-1">{fav.name}</span>
          <button
            onClick={(e) => handleDelete(e, fav.id)}
            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3 text-muted-foreground hover:text-red-500" />
          </button>
        </Button>
      ))}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <FavoriteFormDialog
          name={name} setName={setName}
          type={type} setType={setType}
          amount={amount} setAmount={setAmount}
          category={category} setCategory={setCategory}
          categories={categories}
          onSubmit={handleAddFavorite}
        />
      </Dialog>
    </div>
  )
}

function FavoriteFormDialog({
  name, setName, type, setType, amount, setAmount, category, setCategory, categories, onSubmit,
}: {
  name: string; setName: (v: string) => void
  type: "income" | "expense"; setType: (v: "income" | "expense") => void
  amount: string; setAmount: (v: string) => void
  category: string; setCategory: (v: string) => void
  categories: readonly string[]
  onSubmit: () => void
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>เพิ่มรายการโปรด</DialogTitle>
      </DialogHeader>
      <div className="space-y-3 pt-2">
        <Input placeholder="ชื่อ เช่น กาแฟเช้า" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="flex gap-2">
          <Select value={type} onValueChange={(v) => { setType(v as "income" | "expense"); setCategory("") }}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">รายจ่าย</SelectItem>
              <SelectItem value="income">รายรับ</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" min="0" step="0.01" placeholder="จำนวน" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="เลือกหมวด" /></SelectTrigger>
          <SelectContent>
            {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={onSubmit} disabled={!name || !amount || !category} className="w-full">เพิ่ม</Button>
      </div>
    </DialogContent>
  )
}
