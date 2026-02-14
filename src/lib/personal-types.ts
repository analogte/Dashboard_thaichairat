export interface PersonalTransaction {
  id: number
  date: string
  type: "income" | "expense"
  amount: number
  category: string
  note: string
  created_at: string
}

export interface PersonalBudget {
  id: number
  month: string // "2569-02"
  category: string
  budget_amount: number
  created_at: string
}

export interface PersonalRoutine {
  id: number
  date: string
  activity: string
  value: string
  done: boolean
  note: string
  created_at: string
}

export interface RoutineTemplate {
  id: number
  activity: string
  icon: string
  unit: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface PersonalFavorite {
  id: number
  name: string
  type: "income" | "expense"
  amount: number
  category: string
  created_at: string
}

export interface PersonalSavingsGoal {
  id: number
  name: string
  target_amount: number
  current_amount: number
  deadline: string | null
  created_at: string
}

export interface PersonalHealth {
  id: number
  date: string
  weight: number | null
  blood_pressure_sys: number | null
  blood_pressure_dia: number | null
  blood_sugar: number | null
  sleep_hours: number | null
  note: string
  created_at: string
}

export interface PersonalTodo {
  id: number
  title: string
  done: boolean
  priority: number
  due_date: string | null
  created_at: string
}

export const TODO_PRIORITIES = [
  { value: 1, label: "สูง", color: "text-red-500" },
  { value: 2, label: "กลาง", color: "text-yellow-500" },
  { value: 3, label: "ต่ำ", color: "text-green-500" },
] as const

export const EXPENSE_CATEGORIES = [
  "อาหาร",
  "เดินทาง",
  "ช้อปปิ้ง",
  "ค่าเช่า",
  "สาธารณูปโภค",
  "สุขภาพ",
  "บันเทิง",
  "การศึกษา",
  "ออม/ลงทุน",
  "อื่นๆ",
] as const

export const INCOME_CATEGORIES = [
  "เงินเดือน",
  "รายได้เสริม",
  "รายได้จากร้าน",
  "ของขวัญ",
  "อื่นๆ",
] as const
