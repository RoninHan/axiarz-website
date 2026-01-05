/**
 * 合同预览打印样式
 */

export const getPrintStyles = () => `
<style>
  * {
    box-sizing: border-box;
  }
  
  @media print {
    @page {
      size: A4;
      margin: 20mm;
    }
    
    body {
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      width: 100%;
    }
    
    .print-preview-container {
      width: 100%;
      max-width: none;
      margin: 0;
      padding: 0;
      box-shadow: none;
    }
    
    /* 隐藏不需要打印的元素 */
    .no-print {
      display: none !important;
    }
    
    /* 确保页面断点处理 */
    .page-break-before {
      page-break-before: always;
    }
    
    .page-break-after {
      page-break-after: always;
    }
    
    .avoid-break {
      page-break-inside: avoid;
    }
    
    /* 表格打印优化 */
    table {
      page-break-inside: auto;
      width: 100%;
    }
    
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
    
    thead {
      display: table-header-group;
    }
    
    tfoot {
      display: table-footer-group;
    }
  }
  
  @media screen {
    /* 屏幕预览样式 */
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }
    
    body {
      background-color: #525659;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    
    .print-preview-container {
      width: 210mm;
      min-height: 297mm;
      max-width: 210mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      padding: 20mm;
    }
  }
</style>
`

export const wrapHtmlForPrint = (html: string, title: string = '合同预览') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${getPrintStyles()}
</head>
<body>
  <div class="print-preview-container">
    ${html}
  </div>
</body>
</html>
`
