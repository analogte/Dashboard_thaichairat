"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ListTodo, Plus } from "lucide-react"
import { TodoItem } from "@/components/personal/todo-item"
import { getTodos, addTodo, updateTodo, deleteTodo } from "@/lib/personal-api"
import { TODO_PRIORITIES } from "@/lib/personal-types"
import type { PersonalTodo } from "@/lib/personal-types"

type Filter = "all" | "pending" | "done"

export default function TodosPage() {
  const [todos, setTodos] = useState<PersonalTodo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("all")
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("2")
  const [dueDate, setDueDate] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getTodos()
      setTodos(data)
    } catch (e) {
      console.error("Failed to load todos:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await addTodo({
      title: title.trim(),
      done: false,
      priority: parseInt(priority),
      due_date: dueDate || null,
    })
    setTitle(""); setDueDate("")
    load()
  }

  async function handleToggle(id: number, done: boolean) {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)))
    await updateTodo(id, { done })
    load()
  }

  async function handleDelete(id: number) {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    await deleteTodo(id)
  }

  const filtered = todos.filter((t) => {
    if (filter === "pending") return !t.done
    if (filter === "done") return t.done
    return true
  })

  const pendingCount = todos.filter((t) => !t.done).length
  const doneCount = todos.filter((t) => t.done).length

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ListTodo className="h-6 w-6" />
          <h1 className="text-2xl font-bold">สิ่งที่ต้องทำ</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>ยังไม่ทำ: {pendingCount}</span>
          <span>|</span>
          <span>ทำแล้ว: {doneCount}</span>
        </div>
      </div>

      {/* Add Form */}
      <Card>
        <CardContent className="pt-4">
          <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px] space-y-1">
              <label className="text-xs text-muted-foreground">สิ่งที่ต้องทำ</label>
              <Input
                placeholder="เพิ่มรายการ..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">ความสำคัญ</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TODO_PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={String(p.value)}>
                      <span className={p.color}>{p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">กำหนด</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <Button type="submit" disabled={!title.trim()}>
              <Plus className="h-4 w-4 mr-1" /> เพิ่ม
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "done"] as Filter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "ทั้งหมด" : f === "pending" ? "ยังไม่ทำ" : "ทำแล้ว"}
          </Button>
        ))}
      </div>

      {/* Todo List */}
      <Card>
        <CardHeader>
          <CardTitle>รายการ ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">กำลังโหลด...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {filter === "all" ? "ยังไม่มีรายการ" : filter === "pending" ? "ทำครบทุกอย่างแล้ว!" : "ยังไม่มีรายการที่ทำเสร็จ"}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
