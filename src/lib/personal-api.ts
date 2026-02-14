import { supabase } from "./supabase"
import type {
  PersonalTransaction,
  PersonalBudget,
  PersonalRoutine,
  RoutineTemplate,
  PersonalFavorite,
  PersonalSavingsGoal,
  PersonalHealth,
  PersonalTodo,
} from "./personal-types"

// ==================== Transactions ====================

export async function getTransactions(month: string) {
  const [thaiYear, m] = month.split("-")
  const ceYear = parseInt(thaiYear) - 543
  const startDate = `${ceYear}-${m}-01`
  const endDate =
    parseInt(m) === 12
      ? `${ceYear + 1}-01-01`
      : `${ceYear}-${String(parseInt(m) + 1).padStart(2, "0")}-01`

  const { data, error } = await supabase
    .from("personal_transactions")
    .select("*")
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as PersonalTransaction[]
}

export async function addTransaction(
  tx: Omit<PersonalTransaction, "id" | "created_at">
) {
  const { data, error } = await supabase
    .from("personal_transactions")
    .insert(tx)
    .select()
    .single()

  if (error) throw error
  return data as PersonalTransaction
}

export async function updateTransaction(id: number, updates: Partial<Omit<PersonalTransaction, "id" | "created_at">>) {
  const { data, error } = await supabase
    .from("personal_transactions")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as PersonalTransaction
}

export async function deleteTransaction(id: number) {
  const { error } = await supabase
    .from("personal_transactions")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ==================== Budgets ====================

export async function getBudgets(month: string) {
  const { data, error } = await supabase
    .from("personal_budgets")
    .select("*")
    .eq("month", month)

  if (error) throw error
  return data as PersonalBudget[]
}

export async function upsertBudget(
  month: string,
  category: string,
  budget_amount: number
) {
  const { data, error } = await supabase
    .from("personal_budgets")
    .upsert({ month, category, budget_amount }, { onConflict: "month,category" })
    .select()
    .single()

  if (error) throw error
  return data as PersonalBudget
}

// ==================== Routines ====================

export async function getRoutines(date: string) {
  const { data, error } = await supabase
    .from("personal_routines")
    .select("*")
    .eq("date", date)
    .order("activity")

  if (error) throw error
  return data as PersonalRoutine[]
}

export async function getRoutinesRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("personal_routines")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date")

  if (error) throw error
  return data as PersonalRoutine[]
}

export async function upsertRoutine(
  date: string,
  activity: string,
  done: boolean,
  value?: string,
  note?: string
) {
  const { data, error } = await supabase
    .from("personal_routines")
    .upsert(
      { date, activity, done, value: value ?? "", note: note ?? "" },
      { onConflict: "date,activity" }
    )
    .select()
    .single()

  if (error) throw error
  return data as PersonalRoutine
}

// ==================== Routine Templates ====================

export async function getTemplates() {
  const { data, error } = await supabase
    .from("personal_routine_templates")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")

  if (error) throw error
  return data as RoutineTemplate[]
}

export async function addTemplate(
  activity: string,
  icon: string,
  unit: string
) {
  const { data: existing } = await supabase
    .from("personal_routine_templates")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 1

  const { data, error } = await supabase
    .from("personal_routine_templates")
    .insert({ activity, icon, unit, sort_order: nextOrder })
    .select()
    .single()

  if (error) throw error
  return data as RoutineTemplate
}

export async function deleteTemplate(id: number) {
  const { error } = await supabase
    .from("personal_routine_templates")
    .update({ is_active: false })
    .eq("id", id)

  if (error) throw error
}

// ==================== Favorites ====================

export async function getFavorites() {
  const { data, error } = await supabase
    .from("personal_favorites")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as PersonalFavorite[]
}

export async function addFavorite(fav: Omit<PersonalFavorite, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("personal_favorites")
    .insert(fav)
    .select()
    .single()

  if (error) throw error
  return data as PersonalFavorite
}

export async function updateFavorite(id: number, updates: Partial<Omit<PersonalFavorite, "id" | "created_at">>) {
  const { data, error } = await supabase
    .from("personal_favorites")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as PersonalFavorite
}

export async function deleteFavorite(id: number) {
  const { error } = await supabase
    .from("personal_favorites")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ==================== Savings Goals ====================

export async function getSavingsGoals() {
  const { data, error } = await supabase
    .from("personal_savings_goals")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as PersonalSavingsGoal[]
}

export async function addSavingsGoal(goal: Omit<PersonalSavingsGoal, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("personal_savings_goals")
    .insert(goal)
    .select()
    .single()

  if (error) throw error
  return data as PersonalSavingsGoal
}

export async function updateSavingsGoal(id: number, updates: Partial<PersonalSavingsGoal>) {
  const { data, error } = await supabase
    .from("personal_savings_goals")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as PersonalSavingsGoal
}

export async function deleteSavingsGoal(id: number) {
  const { error } = await supabase
    .from("personal_savings_goals")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ==================== Health ====================

export async function getHealthRecords(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("personal_health")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })

  if (error) throw error
  return data as PersonalHealth[]
}

export async function upsertHealth(record: Omit<PersonalHealth, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("personal_health")
    .upsert(record, { onConflict: "date" })
    .select()
    .single()

  if (error) throw error
  return data as PersonalHealth
}

export async function deleteHealth(id: number) {
  const { error } = await supabase
    .from("personal_health")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ==================== Todos ====================

export async function getTodos() {
  const { data, error } = await supabase
    .from("personal_todos")
    .select("*")
    .order("done")
    .order("priority")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as PersonalTodo[]
}

export async function addTodo(todo: Omit<PersonalTodo, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("personal_todos")
    .insert(todo)
    .select()
    .single()

  if (error) throw error
  return data as PersonalTodo
}

export async function updateTodo(id: number, updates: Partial<PersonalTodo>) {
  const { data, error } = await supabase
    .from("personal_todos")
    .update(updates)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as PersonalTodo
}

export async function deleteTodo(id: number) {
  const { error } = await supabase
    .from("personal_todos")
    .delete()
    .eq("id", id)

  if (error) throw error
}

// ==================== Helpers ====================

/** Convert CE date to Thai Buddhist year string "2569-02" */
export function toThaiMonth(date: Date): string {
  const ceYear = date.getFullYear()
  const thaiYear = ceYear + 543
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${thaiYear}-${month}`
}

/** Convert CE date string "2026-02-14" to "2569-02-14" display */
export function toThaiDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-")
  return `${parseInt(y) + 543}-${m}-${d}`
}

/** Convert Thai month "2569-02" to CE date range */
export function thaiMonthToCERange(month: string): {
  start: string
  end: string
} {
  const [thaiYear, m] = month.split("-")
  const ceYear = parseInt(thaiYear) - 543
  const start = `${ceYear}-${m}-01`
  const end =
    parseInt(m) === 12
      ? `${ceYear + 1}-01-01`
      : `${ceYear}-${String(parseInt(m) + 1).padStart(2, "0")}-01`
  return { start, end }
}

/** Get Thai month name */
export function thaiMonthName(month: string): string {
  const months: Record<string, string> = {
    "01": "มกราคม",
    "02": "กุมภาพันธ์",
    "03": "มีนาคม",
    "04": "เมษายน",
    "05": "พฤษภาคม",
    "06": "มิถุนายน",
    "07": "กรกฎาคม",
    "08": "สิงหาคม",
    "09": "กันยายน",
    "10": "ตุลาคม",
    "11": "พฤศจิกายน",
    "12": "ธันวาคม",
  }
  const [y, m] = month.split("-")
  return `${months[m] || m} ${y}`
}
