import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 为订单补开发票
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未授权', 401)
    }

    const orderId = params.id
    const body = await request.json()
    const { type, title, taxNumber, email } = body

    // 验证订单存在且属于当前用户
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: auth.id
      }
    })

    if (!order) {
      return errorResponse('订单不存在', 404)
    }

    // 检查订单是否已支付
    if (order.paymentStatus !== 'paid') {
      return errorResponse('订单尚未支付，无法开具发票', 400)
    }

    // 检查是否已有发票
    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId: order.id }
    })

    if (existingInvoice) {
      return errorResponse('该订单已申请过发票', 400)
    }

    // 验证发票信息
    if (!title || !type) {
      return errorResponse('发票信息不完整', 400)
    }

    if (type === 'company' && !taxNumber) {
      return errorResponse('企业发票需要提供税号', 400)
    }

    if (!email) {
      return errorResponse('请提供接收发票的邮箱地址', 400)
    }

    // 创建发票记录
    const invoice = await prisma.invoice.create({
      data: {
        orderId: order.id,
        type,
        title,
        taxNumber: taxNumber || '',
        email,
        status: 'pending'
      }
    })

    return successResponse(invoice, '发票申请已提交')
  } catch (error: any) {
    console.error('补开发票失败:', error)
    return errorResponse(error.message || '申请发票失败', 500)
  }
}
