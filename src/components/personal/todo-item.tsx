"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Trash2, Pencil, Check, X } from "lucide-react"
import type { PersonalTodo } from "@/lib/personal-types"
import { TODO_PRIORITIES } from "@/lib/personal-types"

interface TodoItemProps {
  todo: PersonalTodo
  onToggle: (id: number, done: boolean) => void
  onEdit: (id: number, updates: Partial<PersonalTodo>) => void
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editPriority, setEditPriority] = useState(String(todo.priority))
  const [editDueDate, setEditDueDate] = useState(todo.due_date || "")

  const priority = TODO_PRIORITIES.find((p) => p.value === todo.priority)

  function handleSave() {
    onEdit(todo.id, {
      title: editTitle,
      priority: parseInt(editPriority),
      due_date: editDueDate || null,
    })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="p-3 rounded-lg border space-y-2">
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          placeholder="สิ่งที่ต้องทำ"
          autoFocus
        />
        <div className="flex flex-wrap gap-2 items-end">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">ความสำคัญ</label>
            <Select value={editPriority} onValueChange={setEditPriority}>
              <SelectTrigger className="w-[100px] h-8"><SelectValue /></SelectTrigger>
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
            <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} className="w-[150px] h-8" />
          </div>
          <Button size="sm" onClick={handleSave} disabled={!editTitle.trim()}>
            <Check className="h-4 w-4 mr-1" /> บันทึก
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            <X className="h-4 w-4 mr-1" /> ยกเลิก
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        todo.done
          ? "bg-muted/50 border-muted"
          : "hover:bg-muted/30"
      }`}
    >
      <Checkbox
        checked={todo.done}
        onCheckedChange={(checked) => onToggle(todo.id, checked === true)}
      />
      <span className={`w-2 h-2 rounded-full shrink-0 ${priority?.color.replace("text-", "bg-") || "bg-yellow-500"}`} />
      <span className={`flex-1 ${todo.done ? "line-through text-muted-foreground" : ""}`}>
        {todo.title}
      </span>
      {todo.due_date && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(todo.due_date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
        </span>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-blue-500 shrink-0"
        onClick={() => {
          setEditTitle(todo.title)
          setEditPriority(String(todo.priority))
          setEditDueDate(todo.due_date || "")
          setEditing(true)
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-red-500 shrink-0"
        onClick={() => onDelete(todo.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
