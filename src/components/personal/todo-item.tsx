"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import type { PersonalTodo } from "@/lib/personal-types"
import { TODO_PRIORITIES } from "@/lib/personal-types"

interface TodoItemProps {
  todo: PersonalTodo
  onToggle: (id: number, done: boolean) => void
  onDelete: (id: number) => void
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const priority = TODO_PRIORITIES.find((p) => p.value === todo.priority)

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
        className="h-7 w-7 text-muted-foreground hover:text-red-500 shrink-0"
        onClick={() => onDelete(todo.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
