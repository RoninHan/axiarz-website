/**
 * 合同模板渲染器
 * 将模板 JSON 结构 + 订单数据渲染成 HTML
 */

import { ContractTemplate, TemplateComponent } from '@/types/contract-template'

interface OrderData {
  orderNumber: string
  createdAt: Date | string
  status: string
  paymentStatus: string
  paymentMethod?: string
  user: {
    name?: string
    email: string
    phone?: string
  }
  address: {
    name: string
    phone: string
    province: string
    city: string
    district: string
    detail: string
    postalCode?: string
  }
  items: Array<{
    product: {
      name: string
      sku?: string
    }
    quantity: number
    price: number
  }>
  originalAmount?: number
  discountAmount?: number
  totalAmount: number
  notes?: string
}

/**
 * 获取嵌套字段值
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split('.')
  let current = obj
  for (const part of parts) {
    if (current == null) return ''
    current = current[part]
  }
  return current ?? ''
}

/**
 * 格式化日期
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 格式化金额
 */
function formatAmount(amount: number): string {
  return `¥${amount.toFixed(2)}`
}

/**
 * 渲染单个组件
 */
function renderComponent(component: TemplateComponent, data: OrderData): string {
  const { type, props, styles = {} } = component
  const styleStr = Object.entries(styles).map(([k, v]) => `${k}: ${v}`).join('; ')

  switch (type) {
    case 'text':
      return `<p style="text-align: ${props.align || 'left'}; font-size: ${props.fontSize || 12}px; color: ${props.color || '#333'}; font-weight: ${props.bold ? 'bold' : 'normal'}; font-style: ${props.italic ? 'italic' : 'normal'}; margin: 8px 0; ${styleStr}">${props.content}</p>`

    case 'heading':
      const tag = `h${props.level || 1}`
      return `<${tag} style="text-align: ${props.align || 'left'}; color: ${props.color || '#333'}; margin: 16px 0; ${styleStr}">${props.content}</${tag}>`

    case 'image':
      return `<div style="text-align: ${props.align || 'center'}; margin: 16px 0; ${styleStr}"><img src="${props.src}" alt="${props.alt || ''}" style="width: ${props.width || 'auto'}px; height: ${props.height || 'auto'}px;" /></div>`

    case 'divider':
      return `<hr style="border: none; border-top: ${props.thickness || 1}px solid ${props.color || '#ddd'}; margin: ${props.margin || 16}px 0; ${styleStr}" />`

    case 'spacer':
      return `<div style="height: ${props.height || 20}px; ${styleStr}"></div>`

    case 'orderInfo':
      const orderFields = props.fields.map((f: any) => {
        let value = getNestedValue(data, f.field)
        if (f.field === 'createdAt') value = formatDate(value)
        if (f.field === 'status') value = getStatusText(value, 'order')
        if (f.field === 'paymentStatus') value = getStatusText(value, 'payment')
        return `<div class="info-row"><span class="info-label">${f.label}:</span><span class="info-value">${value}</span></div>`
      }).join('')
      return `<div class="section" style="${styleStr}">
        ${props.title ? `<h3 class="section-title">${props.title}</h3>` : ''}
        ${orderFields}
      </div>`

    case 'customerInfo':
      const customerFields = props.fields.map((f: any) => {
        const value = getNestedValue(data, f.field)
        return `<div class="info-row"><span class="info-label">${f.label}:</span><span class="info-value">${value || 'N/A'}</span></div>`
      }).join('')
      return `<div class="section" style="${styleStr}">
        ${props.title ? `<h3 class="section-title">${props.title}</h3>` : ''}
        ${customerFields}
      </div>`

    case 'addressInfo':
      const addr = data.address
      const fullAddress = `${addr.province} ${addr.city} ${addr.district} ${addr.detail}`
      return `<div class="section" style="${styleStr}">
        ${props.title ? `<h3 class="section-title">${props.title}</h3>` : ''}
        <div class="info-row"><span class="info-label">收件人:</span><span class="info-value">${addr.name}</span></div>
        <div class="info-row"><span class="info-label">联系电话:</span><span class="info-value">${addr.phone}</span></div>
        <div class="info-row"><span class="info-label">详细地址:</span><span class="info-value">${fullAddress}</span></div>
        ${addr.postalCode ? `<div class="info-row"><span class="info-label">邮编:</span><span class="info-value">${addr.postalCode}</span></div>` : ''}
      </div>`

    case 'productTable':
      const headers = props.showIndex 
        ? `<th class="text-center" style="width: 50px;">序号</th>${props.columns.map((col: any) => `<th class="text-${col.align || 'left'}" style="width: ${col.width || 'auto'}px;">${col.header}</th>`).join('')}`
        : props.columns.map((col: any) => `<th class="text-${col.align || 'left'}" style="width: ${col.width || 'auto'}px;">${col.header}</th>`).join('')
      
      const rows = data.items.map((item, idx) => {
        const cells = props.columns.map((col: any) => {
          let value: any
          if (col.field === 'product.name') value = item.product.name
          else if (col.field === 'product.sku') value = item.product.sku || 'N/A'
          else if (col.field === 'quantity') value = item.quantity
          else if (col.field === 'price') value = formatAmount(item.price)
          else if (col.field === 'subtotal') value = formatAmount(item.quantity * item.price)
          else value = getNestedValue(item, col.field)
          
          return `<td class="text-${col.align || 'left'}">${value}</td>`
        }).join('')
        
        return `<tr>
          ${props.showIndex ? `<td class="text-center">${idx + 1}</td>` : ''}
          ${cells}
        </tr>`
      }).join('')

      return `<div class="section" style="${styleStr}">
        ${props.title ? `<h3 class="section-title">${props.title}</h3>` : ''}
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead style="background-color: ${props.headerColor || '#667eea'}; color: white;">
            <tr>${headers}</tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`

    case 'totalAmount':
      let totalHtml = ''
      if (props.showOriginal && data.originalAmount) {
        totalHtml += `<div class="summary-row"><span class="summary-label">原价:</span><span class="summary-value">${formatAmount(data.originalAmount)}</span></div>`
      }
      if (props.showDiscount && data.discountAmount) {
        totalHtml += `<div class="summary-row"><span class="summary-label">优惠:</span><span class="summary-value" style="color: red;">-${formatAmount(data.discountAmount)}</span></div>`
      }
      totalHtml += `<div class="summary-row total"><span class="summary-label">总计:</span><span class="summary-value">${formatAmount(data.totalAmount)}</span></div>`
      
      return `<div class="summary" style="text-align: ${props.align || 'right'}; margin-top: 20px; ${styleStr}">${totalHtml}</div>`

    case 'signature':
      return `<div class="signature" style="margin-top: 40px; ${styleStr}">
        <div style="display: inline-block; width: ${props.width || 200}px; border-top: 1px solid #333; padding-top: 8px;">
          <div style="text-align: center; font-weight: bold;">${props.label || '签名'}</div>
          ${props.showDate ? `<div style="text-align: center; margin-top: 8px; font-size: 12px;">日期: _____________</div>` : ''}
        </div>
      </div>`

    default:
      return ''
  }
}

/**
 * 获取状态文本
 */
function getStatusText(status: string, type: 'order' | 'payment'): string {
  if (type === 'order') {
    const map: Record<string, string> = {
      'pending': '待处理',
      'paid': '已支付',
      'shipped': '已发货',
      'delivered': '已送达',
      'cancelled': '已取消',
      'completed': '已完成'
    }
    return map[status] || status
  } else {
    const map: Record<string, string> = {
      'unpaid': '未支付',
      'paid': '已支付',
      'refunded': '已退款',
      'pending': '待支付'
    }
    return map[status] || status
  }
}

/**
 * 渲染完整的合同模板
 */
export function renderContractTemplate(template: ContractTemplate, data: OrderData): string {
  const componentsHtml = template.components.map(comp => renderComponent(comp, data)).join('\n')
  
  const pageStyles = template.styles || {}
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: ${pageStyles.pageSize || 'A4'};
      margin: ${pageStyles.margin || 20}mm;
    }
    body {
      font-family: ${pageStyles.fontFamily || '"Microsoft YaHei", "SimSun", Arial, sans-serif'};
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
      background-color: ${pageStyles.backgroundColor || '#ffffff'};
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .info-label {
      width: 120px;
      font-weight: bold;
      color: #666;
    }
    .info-value {
      flex: 1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table th, table td {
      border: 1px solid #ddd;
      padding: 10px;
    }
    table tbody tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .text-left { text-align: left; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .summary-row {
      margin-bottom: 8px;
    }
    .summary-label {
      display: inline-block;
      width: 150px;
      font-weight: bold;
    }
    .summary-value {
      display: inline-block;
      width: 150px;
      text-align: right;
    }
    .total {
      font-size: 16px;
      font-weight: bold;
      color: #ff0000;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  ${componentsHtml}
</body>
</html>
  `
}
