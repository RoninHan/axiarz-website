/**
 * 浏览器打印工具函数
 * 解决打印时页面变形的问题
 */

export interface PrintOptions {
  title?: string
  delay?: number
  onBeforePrint?: () => void
  onAfterPrint?: () => void
}

/**
 * 在新窗口中打印 HTML 内容
 */
export function printHtmlInNewWindow(
  html: string,
  options: PrintOptions = {}
): void {
  const {
    title = '打印预览',
    delay = 500,
    onBeforePrint,
    onAfterPrint
  } = options

  // 创建新窗口
  const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes')
  
  if (!printWindow) {
    throw new Error('无法打开打印窗口，请检查浏览器弹窗设置')
  }

  // 写入 HTML
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()

  // 等待加载完成
  const waitForLoad = () => {
    return new Promise<void>((resolve) => {
      if (printWindow.document.readyState === 'complete') {
        resolve()
      } else {
        printWindow.addEventListener('load', () => resolve())
      }
    })
  }

  // 执行打印
  waitForLoad().then(() => {
    setTimeout(() => {
      try {
        onBeforePrint?.()
        printWindow.focus()
        printWindow.print()
        
        // 监听打印完成
        printWindow.addEventListener('afterprint', () => {
          onAfterPrint?.()
        })
      } catch (error) {
        console.error('打印失败:', error)
      }
    }, delay)
  })
}

/**
 * 生成打印专用样式
 */
export function generatePrintStyles(): string {
  return `
    <style>
      * {
        box-sizing: border-box;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
      }
      
      @media print {
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        
        .print-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding: 0;
          box-shadow: none;
        }
        
        .no-print {
          display: none !important;
        }
        
        .page-break {
          page-break-after: always;
        }
        
        .avoid-break {
          page-break-inside: avoid;
        }
        
        table {
          width: 100%;
          page-break-inside: auto;
        }
        
        tr {
          page-break-inside: avoid;
        }
        
        thead {
          display: table-header-group;
        }
      }
      
      @media screen {
        body {
          background-color: #525659;
          padding: 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 100vh;
        }
        
        .print-container {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);
          padding: 20mm;
        }
      }
    </style>
  `
}

/**
 * 包装 HTML 用于打印
 */
export function wrapForPrint(content: string, title: string = '打印预览'): string {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${generatePrintStyles()}
</head>
<body>
  <div class="print-container">
    ${content}
  </div>
</body>
</html>
  `.trim()
}
