/**
 * CSV Export utility for dashboard data
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportCSV(filename: string, headers: string[], rows: any[], keys: string[]) {
  const bom = "\uFEFF" // UTF-8 BOM for Thai text in Excel
  const headerLine = headers.join(",")
  const dataLines = rows.map((row: Record<string, unknown>) =>
    keys
      .map((key) => {
        const val = row[key]
        if (val == null) return ""
        const str = String(val)
        // Escape quotes and wrap if contains comma/quote/newline
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      .join(","),
  )
  const csv = bom + [headerLine, ...dataLines].join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
