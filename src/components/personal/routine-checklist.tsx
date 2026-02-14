"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import type { RoutineTemplate, PersonalRoutine } from "@/lib/personal-types"

interface RoutineChecklistProps {
  templates: RoutineTemplate[]
  routines: PersonalRoutine[]
  onToggle: (activity: string, done: boolean) => void
  onValueChange: (activity: string, value: string) => void
}

export function RoutineChecklist({
  templates,
  routines,
  onToggle,
  onValueChange,
}: RoutineChecklistProps) {
  const routineMap = new Map(routines.map((r) => [r.activity, r]))

  return (
    <div className="space-y-3">
      {templates.map((t) => {
        const r = routineMap.get(t.activity)
        const done = r?.done ?? false
        const value = r?.value ?? ""

        return (
          <div
            key={t.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${done ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900" : "hover:bg-muted/50"}`}
          >
            <Checkbox
              checked={done}
              onCheckedChange={(checked) =>
                onToggle(t.activity, checked === true)
              }
            />
            <span className="text-lg">{t.icon}</span>
            <span
              className={`flex-1 font-medium ${done ? "line-through text-muted-foreground" : ""}`}
            >
              {t.activity}
            </span>
            {t.unit && (
              <div className="flex items-center gap-1">
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => onValueChange(t.activity, e.target.value)}
                  placeholder="0"
                  className="w-[60px] h-8 text-center text-sm"
                />
                <span className="text-xs text-muted-foreground">{t.unit}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
