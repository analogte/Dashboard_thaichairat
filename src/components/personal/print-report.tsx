"use client"

import type { PersonalTransaction } from "@/lib/personal-types"

interface PrintReportProps {
  month: string
  transactions: PersonalTransaction[]
  totalIncome: number
  totalExpense: number
  budgetMap: Record<string, number>
}

export function PrintReport({ month, transactions, totalIncome, totalExpense, budgetMap }: PrintReportProps) {
  const fmt = (n: number) => n.toLocaleString("th-TH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  // expense by category
  const expenseByCategory: Record<string, number> = {}
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + Number(t.amount)
    })

  const net = totalIncome - totalExpense

  return (
    <div className="print-only hidden print:block p-8 text-black bg-white">
      <h1 className="text-2xl font-bold mb-2">รายงานการเงินส่วนตัว</h1>
      <p className="text-sm text-gray-600 mb-6">เดือน {month}</p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border p-3 rounded">
          <p className="text-xs text-gray-500">รายรับ</p>
          <p className="text-lg font-bold text-green-700">{fmt(totalIncome)} ฿</p>
        </div>
        <div className="border p-3 rounded">
          <p className="text-xs text-gray-500">รายจ่าย</p>
          <p className="text-lg font-bold text-red-700">{fmt(totalExpense)} ฿</p>
        </div>
        <div className="border p-3 rounded">
          <p className="text-xs text-gray-500">สุทธิ</p>
          <p className={`text-lg font-bold ${net >= 0 ? "text-green-700" : "text-red-700"}`}>{fmt(net)} ฿</p>
        </div>
      </div>

      {/* Category Table */}
      <h2 className="text-lg font-bold mb-2">รายจ่ายตามหมวด</h2>
      <table className="w-full text-sm border-collapse mb-6">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1.5">หมวด</th>
            <th className="text-right py-1.5">ใช้จริง</th>
            <th className="text-right py-1.5">งบ</th>
            <th className="text-right py-1.5">ส่วนต่าง</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(expenseByCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => {
              const budget = budgetMap[cat] || 0
              const diff = budget - amount
              return (
                <tr key={cat} className="border-b">
                  <td className="py-1.5">{cat}</td>
                  <td className="text-right">{fmt(amount)} ฿</td>
                  <td className="text-right">{budget > 0 ? `${fmt(budget)} ฿` : "-"}</td>
                  <td className={`text-right ${diff >= 0 ? "text-green-700" : "text-red-700"}`}>
                    {budget > 0 ? `${fmt(diff)} ฿` : "-"}
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>

      {/* Transaction List */}
      <h2 className="text-lg font-bold mb-2">รายการทั้งหมด ({transactions.length} รายการ)</h2>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left py-1">วันที่</th>
            <th className="text-left py-1">ประเภท</th>
            <th className="text-left py-1">หมวด</th>
            <th className="text-right py-1">จำนวน</th>
            <th className="text-left py-1">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-b">
              <td className="py-1">{tx.date}</td>
              <td className="py-1">{tx.type === "income" ? "รายรับ" : "รายจ่าย"}</td>
              <td className="py-1">{tx.category}</td>
              <td className={`py-1 text-right ${tx.type === "income" ? "text-green-700" : "text-red-700"}`}>
                {tx.type === "income" ? "+" : "-"}{fmt(Number(tx.amount))}
              </td>
              <td className="py-1">{tx.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-6 text-xs text-gray-400 text-center">
        สร้างจาก Life Dashboard — {new Date().toLocaleDateString("th-TH")}
      </p>
    </div>
  )
}
