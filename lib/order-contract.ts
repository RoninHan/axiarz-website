import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { generateContractHTML } from './order-contract-html'

// 中文字体支持
// 使用 HTML 方法生成 PDF 可以更好地支持中文

/**
 * 添加中文字体支持到 PDF
 */
function setupChineseFont(doc: jsPDF) {
  // 使用标准字体
  doc.setFont('helvetica', 'normal')
  doc.setCharSpace(0.5)
}

interface OrderItem {
  product: {
    name: string
    sku?: string
  }
  quantity: number
  price: number
}

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
  items: OrderItem[]
  originalAmount?: number
  discountAmount?: number
  totalAmount: number
  paymentMethod?: string
  paymentStatus: string
  status: string
  notes?: string
}

/**
 * 生成订单合同PDF
 */
export function generateOrderContractPDF(order: OrderContractData): jsPDF {
  const doc = new jsPDF()
  
  // 设置中文字体支持
  setupChineseFont(doc)
  
  let yPos = 20
  
  // 标题
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('ORDER CONTRACT', 105, yPos, { align: 'center' })
  yPos += 15
  
  // 公司信息
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('AXIARZ Technology Co., Ltd.', 105, yPos, { align: 'center' })
  yPos += 10
  
  // 分割线
  doc.setLineWidth(0.5)
  doc.line(20, yPos, 190, yPos)
  yPos += 10
  
  // 订单基本信息
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('Order Information', 20, yPos)
  yPos += 8
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  const orderDate = new Date(order.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
  
  const basicInfo = [
    ['Order Number:', order.orderNumber],
    ['Order Date:', orderDate],
    ['Payment Status:', getPaymentStatusText(order.paymentStatus)],
    ['Order Status:', getOrderStatusText(order.status)],
  ]
  
  if (order.paymentMethod) {
    basicInfo.push(['Payment Method:', getPaymentMethodText(order.paymentMethod)])
  }
  
  basicInfo.forEach(([label, value]) => {
    doc.text(label, 25, yPos)
    doc.text(value, 90, yPos)
    yPos += 6
  })
  
  yPos += 5
  
  // 客户信息
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Customer Information', 20, yPos)
  yPos += 8
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  const customerInfo = [
    ['Name:', order.user.name || 'N/A'],
    ['Email:', order.user.email],
  ]
  
  if (order.user.phone) {
    customerInfo.push(['Phone:', order.user.phone])
  }
  
  customerInfo.forEach(([label, value]) => {
    doc.text(label, 25, yPos)
    doc.text(value, 90, yPos)
    yPos += 6
  })
  
  yPos += 5
  
  // 收货地址
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Shipping Address', 20, yPos)
  yPos += 8
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  const fullAddress = `${order.address.province} ${order.address.city} ${order.address.district} ${order.address.detail}`
  
  const addressInfo = [
    ['Recipient:', order.address.name],
    ['Phone:', order.address.phone],
    ['Address:', fullAddress],
  ]
  
  if (order.address.postalCode) {
    addressInfo.push(['Postal Code:', order.address.postalCode])
  }
  
  addressInfo.forEach(([label, value]) => {
    doc.text(label, 25, yPos)
    const lines = doc.splitTextToSize(value, 100)
    doc.text(lines, 90, yPos)
    yPos += 6 * lines.length
  })
  
  yPos += 10
  
  // 商品明细表格
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Product Details', 20, yPos)
  yPos += 5
  
  // 准备表格数据
  const tableData = order.items.map((item, index) => [
    (index + 1).toString(),
    item.product.sku || 'N/A',
    item.product.name, // 直接使用产品名称，支持中文
    item.quantity.toString(),
    `¥${item.price.toFixed(2)}`,
    `¥${(item.quantity * item.price).toFixed(2)}`
  ])
  
  autoTable(doc, {
    startY: yPos,
    head: [['No.', 'SKU', 'Product Name', 'Qty', 'Unit Price', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [102, 126, 234],
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'center', cellWidth: 25 },
      2: { halign: 'left', cellWidth: 60 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 30 },
      5: { halign: 'right', cellWidth: 30 }
    },
    margin: { left: 20, right: 20 }
  })
  
  // 获取表格结束位置
  yPos = (doc as any).lastAutoTable.finalY + 10
  
  // 金额汇总
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  
  const summaryX = 130
  
  if (order.originalAmount && order.discountAmount) {
    doc.text('Original Amount:', summaryX, yPos)
    doc.text(`¥${order.originalAmount.toFixed(2)}`, 180, yPos, { align: 'right' })
    yPos += 6
    
    doc.text('Discount:', summaryX, yPos)
    doc.setTextColor(255, 0, 0)
    doc.text(`-¥${order.discountAmount.toFixed(2)}`, 180, yPos, { align: 'right' })
    doc.setTextColor(0, 0, 0)
    yPos += 6
  }
  
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Total Amount:', summaryX, yPos)
  doc.setTextColor(255, 0, 0)
  doc.text(`¥${order.totalAmount.toFixed(2)}`, 180, yPos, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  yPos += 10
  
  // 备注
  if (order.notes) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Notes:', 20, yPos)
    yPos += 6
    
    doc.setFont('helvetica', 'normal')
    const noteLines = doc.splitTextToSize(order.notes, 170)
    doc.text(noteLines, 20, yPos)
    yPos += 6 * noteLines.length + 10
  }
  
  // 页脚
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    
    // 合同条款提示
    const footerY = 280
    doc.text('This is a legally binding contract. Please keep it properly.', 105, footerY, { align: 'center' })
    
    // 页码
    doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' })
    
    doc.setTextColor(0, 0, 0)
  }
  
  return doc
}

/**
 * 获取支付状态文本
 */
function getPaymentStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'unpaid': 'Unpaid',
    'paid': 'Paid',
    'refunded': 'Refunded',
    'pending': 'Pending'
  }
  return statusMap[status] || status
}

/**
 * 获取订单状态文本
 */
function getOrderStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'paid': 'Paid',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'completed': 'Completed'
  }
  return statusMap[status] || status
}

/**
 * 获取支付方式文本
 */
function getPaymentMethodText(method: string): string {
  const methodMap: Record<string, string> = {
    'alipay': 'Alipay',
    'wechat': 'WeChat Pay',
    'bank': 'Bank Transfer',
    'wallet': 'Wallet'
  }
  return methodMap[method] || method
}

/**
 * 下载PDF文件
 */
export function downloadOrderContractPDF(order: OrderContractData): void {
  const doc = generateOrderContractPDF(order)
  const filename = `Order_Contract_${order.orderNumber}.pdf`
  doc.save(filename)
}

/**
 * 生成支持中文的订单合同PDF（使用 HTML 方法）
 * 这个方法在浏览器中运行，可以正确渲染中文
 */
export async function generateOrderContractPDFWithChinese(order: OrderContractData): Promise<jsPDF> {
  const html = generateContractHTML(order)
  const doc = new jsPDF('p', 'mm', 'a4')
  
  // 创建一个临时容器来渲染 HTML
  const tempContainer = document.createElement('div')
  tempContainer.innerHTML = html
  tempContainer.style.position = 'absolute'
  tempContainer.style.left = '-9999px'
  tempContainer.style.top = '0'
  document.body.appendChild(tempContainer)
  
  try {
    // 使用 html 方法生成 PDF
    await doc.html(tempContainer, {
      callback: function() {
        // 清理临时容器
        document.body.removeChild(tempContainer)
      },
      x: 10,
      y: 10,
      width: 190, // A4 宽度减去边距
      windowWidth: 800,
      html2canvas: {
        scale: 0.75 // 调整缩放比例
      }
    })
    
    return doc
  } catch (error) {
    // 如果失败，清理临时容器并抛出错误
    document.body.removeChild(tempContainer)
    throw error
  }
}

/**
 * 下载支持中文的 PDF 合同
 */
export async function downloadOrderContractPDFWithChinese(order: OrderContractData): Promise<void> {
  const doc = await generateOrderContractPDFWithChinese(order)
  const filename = `Order_Contract_${order.orderNumber}.pdf`
  doc.save(filename)
}
