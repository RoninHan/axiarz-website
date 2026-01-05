/**
 * 订单合同 HTML 模板生成器
 * 用于生成支持中文的 PDF 合同
 */

import { jsPDF } from 'jspdf'

interface OrderContractData {
  orderNumber: string
  createdAt: Date
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
  paymentMethod?: string
  paymentStatus: string
  status: string
  notes?: string
}

/**
 * 生成 HTML 格式的订单合同
 */
// 简单模板渲染：支持 {{key}} 与嵌套字段如 {{user.name}}
function renderTemplate(template: string, data: any): string {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, path) => {
    const parts = path.split('.')
    let cur: any = data
    for (const p of parts) {
      if (cur == null) return ''
      cur = cur[p]
    }
    return String(cur ?? '')
  })
}

export function generateContractHTML(order: OrderContractData, template?: string): string {
  // 如果提供了自定义模板，优先通过简单渲染引入数据
  if (template && typeof template === 'string' && template.trim().length > 0) {
    // 为 items 提供特殊 HTML 片段生成器
    const itemsHtml = order.items.map((item, index) => `\n<tr>\n  <td class="text-center">${index + 1}</td>\n  <td class="text-center">${item.product.sku || 'N/A'}</td>\n  <td>${item.product.name}</td>\n  <td class="text-center">${item.quantity}</td>\n  <td class="text-right">¥${item.price.toFixed(2)}</td>\n  <td class="text-right">¥${(item.quantity * item.price).toFixed(2)}</td>\n</tr>`).join('')

    const dataForRender = {
      ...order,
      createdAt: new Date(order.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      itemsHtml,
    }

    return renderTemplate(template, dataForRender)
  }

  // fallback to default template
  const orderDate = new Date(order.createdAt).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: "Microsoft YaHei", "SimSun", Arial, sans-serif;
          font-size: 12px;
          line-height: 1.6;
          color: #333;
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 20px;
        }
        .header h1 {
          font-size: 24px;
          margin: 0 0 10px 0;
          color: #667eea;
        }
        .header .company {
          font-size: 14px;
          color: #666;
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
          margin: 15px 0;
        }
        table thead {
          background-color: #667eea;
          color: white;
        }
        table th, table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        table th {
          font-weight: bold;
        }
        table tbody tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .summary {
          margin-top: 20px;
          text-align: right;
        }
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
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 10px;
          color: #999;
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>订单合同 Order Contract</h1>
        <div class="company">AXIARZ Technology Co., Ltd. | AXIARZ 科技有限公司</div>
      </div>

      <div class="section">
        <div class="section-title">订单信息 Order Information</div>
        <div class="info-row">
          <div class="info-label">订单号 Order Number:</div>
          <div class="info-value">${order.orderNumber}</div>
        </div>
        <div class="info-row">
          <div class="info-label">下单时间 Order Date:</div>
          <div class="info-value">${orderDate}</div>
        </div>
        <div class="info-row">
          <div class="info-label">订单状态 Status:</div>
          <div class="info-value">${getOrderStatusText(order.status)}</div>
        </div>
        <div class="info-row">
          <div class="info-label">支付状态 Payment Status:</div>
          <div class="info-value">${getPaymentStatusText(order.paymentStatus)}</div>
        </div>
        ${order.paymentMethod ? `
        <div class="info-row">
          <div class="info-label">支付方式 Payment Method:</div>
          <div class="info-value">${getPaymentMethodText(order.paymentMethod)}</div>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">客户信息 Customer Information</div>
        <div class="info-row">
          <div class="info-label">姓名 Name:</div>
          <div class="info-value">${order.user.name || 'N/A'}</div>
        </div>
        <div class="info-row">
          <div class="info-label">邮箱 Email:</div>
          <div class="info-value">${order.user.email}</div>
        </div>
        ${order.user.phone ? `
        <div class="info-row">
          <div class="info-label">电话 Phone:</div>
          <div class="info-value">${order.user.phone}</div>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">收货地址 Shipping Address</div>
        <div class="info-row">
          <div class="info-label">收件人 Recipient:</div>
          <div class="info-value">${order.address.name}</div>
        </div>
        <div class="info-row">
          <div class="info-label">联系电话 Phone:</div>
          <div class="info-value">${order.address.phone}</div>
        </div>
        <div class="info-row">
          <div class="info-label">详细地址 Address:</div>
          <div class="info-value">${order.address.province} ${order.address.city} ${order.address.district} ${order.address.detail}</div>
        </div>
        ${order.address.postalCode ? `
        <div class="info-row">
          <div class="info-label">邮编 Postal Code:</div>
          <div class="info-value">${order.address.postalCode}</div>
        </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">商品明细 Product Details</div>
        <table>
          <thead>
            <tr>
              <th class="text-center" style="width: 50px;">序号</th>
              <th class="text-center" style="width: 100px;">SKU</th>
              <th>产品名称 Product Name</th>
              <th class="text-center" style="width: 80px;">数量 Qty</th>
              <th class="text-right" style="width: 100px;">单价 Price</th>
              <th class="text-right" style="width: 120px;">小计 Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, index) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td class="text-center">${item.product.sku || 'N/A'}</td>
              <td>${item.product.name}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">¥${item.price.toFixed(2)}</td>
              <td class="text-right">¥${(item.quantity * item.price).toFixed(2)}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          ${order.originalAmount && order.discountAmount ? `
          <div class="summary-row">
            <span class="summary-label">原价 Original Amount:</span>
            <span class="summary-value">¥${order.originalAmount.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">优惠 Discount:</span>
            <span class="summary-value" style="color: red;">-¥${order.discountAmount.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="summary-row total">
            <span class="summary-label">总计 Total Amount:</span>
            <span class="summary-value">¥${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      ${order.notes ? `
      <div class="section">
        <div class="section-title">备注 Notes</div>
        <div>${order.notes}</div>
      </div>
      ` : ''}

      <div class="footer">
        <div>本合同具有法律效力，请妥善保管</div>
        <div>This is a legally binding contract. Please keep it properly.</div>
      </div>
    </body>
    </html>
  `
}

function getOrderStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': '待处理 Pending',
    'paid': '已支付 Paid',
    'shipped': '已发货 Shipped',
    'delivered': '已送达 Delivered',
    'cancelled': '已取消 Cancelled',
    'completed': '已完成 Completed'
  }
  return statusMap[status] || status
}

function getPaymentStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'unpaid': '未支付 Unpaid',
    'paid': '已支付 Paid',
    'refunded': '已退款 Refunded',
    'pending': '待支付 Pending'
  }
  return statusMap[status] || status
}

function getPaymentMethodText(method: string): string {
  const methodMap: Record<string, string> = {
    'alipay': '支付宝 Alipay',
    'wechat': '微信支付 WeChat Pay',
    'bank': '银行转账 Bank Transfer',
    'wallet': '钱包支付 Wallet'
  }
  return methodMap[method] || method
}

/**
 * 使用 HTML 生成 PDF (支持中文)
 * 注意：这个方法需要在客户端浏览器中运行
 */
export async function generatePDFFromHTML(order: OrderContractData): Promise<jsPDF> {
  const html = generateContractHTML(order)
  const doc = new jsPDF('p', 'mm', 'a4')
  
  // 使用 jsPDF 的 html 方法从 HTML 生成 PDF
  await doc.html(html, {
    callback: function(doc) {
      return doc
    },
    x: 0,
    y: 0,
    width: 210, // A4 宽度
    windowWidth: 800
  })
  
  return doc
}
