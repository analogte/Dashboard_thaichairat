/**
 * PDF Export utility using browser's built-in print functionality
 * No external dependencies required
 */

export function exportPDF(title: string) {
  // Store original title
  const originalTitle = document.title

  // Set the title for the PDF filename
  document.title = title

  // Add print-specific styles
  const style = document.createElement("style")
  style.id = "pdf-print-styles"
  style.textContent = `
    @media print {
      /* Hide sidebar, header, and buttons */
      [data-slot="sidebar-container"],
      [data-slot="sidebar-wrapper"] > button,
      header,
      button,
      kbd,
      nav {
        display: none !important;
      }

      /* Full width content */
      [data-slot="sidebar-inset"] {
        margin-left: 0 !important;
        width: 100% !important;
      }

      /* Ensure background colors print */
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      /* Page setup */
      @page {
        size: A4 landscape;
        margin: 1cm;
      }

      /* Force light theme for printing */
      .dark {
        --background: oklch(1 0 0) !important;
        --foreground: oklch(0.145 0 0) !important;
        --card: oklch(0.98 0 0) !important;
        --card-foreground: oklch(0.145 0 0) !important;
        --muted-foreground: oklch(0.4 0 0) !important;
        --border: oklch(0.85 0 0) !important;
      }

      /* Add title */
      body::before {
        content: "${title}";
        display: block;
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #333;
      }

      /* Add date */
      body::after {
        content: "พิมพ์เมื่อ: ${new Date().toLocaleString("th-TH")}";
        display: block;
        font-size: 10px;
        color: #666;
        margin-top: 16px;
        padding-top: 8px;
        border-top: 1px solid #ccc;
      }
    }
  `
  document.head.appendChild(style)

  // Trigger print
  window.print()

  // Cleanup
  setTimeout(() => {
    document.title = originalTitle
    style.remove()
  }, 1000)
}

/**
 * Export a specific table/section as PDF by creating a printable window
 */
export function exportSectionPDF(title: string, htmlContent: string) {
  const win = window.open("", "_blank")
  if (!win) return

  win.document.write(`
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="utf-8" />
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 20px;
          color: #333;
          line-height: 1.5;
        }
        h1 {
          font-size: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px 12px;
          text-align: left;
          font-size: 13px;
        }
        th {
          background: #f5f5f5;
          font-weight: 600;
        }
        tr:nth-child(even) { background: #fafafa; }
        .text-right { text-align: right; }
        .text-green { color: #16a34a; }
        .text-red { color: #dc2626; }
        .footer {
          margin-top: 24px;
          padding-top: 8px;
          border-top: 1px solid #ccc;
          font-size: 11px;
          color: #888;
        }
        @page { size: A4 landscape; margin: 1.5cm; }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${htmlContent}
      <div class="footer">
        พิมพ์เมื่อ: ${new Date().toLocaleString("th-TH")} | ThaichaiRat Dashboard
      </div>
    </body>
    </html>
  `)
  win.document.close()
  setTimeout(() => win.print(), 300)
}
