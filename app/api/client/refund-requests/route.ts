import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const data = await request.json()
    const { orderId, reason, amount, refundMethod, bankName, bankAccount, accountName } = data

    if (!orderId || !reason || !amount || !refundMethod) {
      return errorResponse('请填写完整的退款信息')
    }

    // 验证订单是否存在且属于当前用户
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { refunds: true }
    })

    if (!order || order.userId !== auth.id) {
      return errorResponse('订单不存在', 404)
    }

    // 检查订单状态是否支持退款
    if (!['paid', 'shipped', 'delivered'].includes(order.status)) {
      return errorResponse('当前订单状态不支持退款申请', 400)
    }

    // 检查是否已有未处理的退款申请
    const pendingRefund = order.refunds?.find(r => r.status === 'pending')
    if (pendingRefund) {
      return errorResponse('您已有未处理的退款申请', 400)
    }

    // 验证退款金额
    const refundAmount = Number(amount)
    if (isNaN(refundAmount) || refundAmount <= 0 || refundAmount > Number(order.totalAmount)) {
      return errorResponse('退款金额无效', 400)
    }

    // 如果选择银行卡退款，验证银行信息
    if (refundMethod === 'bank') {
      if (!bankName || !bankAccount || !accountName) {
        return errorResponse('请填写完整的银行卡信息', 400)
      }

      // 验证银行卡号格式（简单验证）
      if (!/^\d{16,19}$/.test(bankAccount)) {
        return errorResponse('银行卡号格式不正确', 400)
      }

      // 验证支持的银行
      const supportedBanks = ['ICBC', 'ABC', 'BOC', 'CCB']
      if (!supportedBanks.includes(bankName)) {
        return errorResponse('不支持该银行', 400)
      }
    }

    // 创建退款申请
    const refundRequest = await prisma.refundRequest.create({
      data: {
        orderId,
        userId: auth.id,
        reason,
        amount: refundAmount,
        refundMethod,
        ...(refundMethod === 'bank' && {
          bankName,
          bankAccount,
          accountName,
        }),
      },
      include: {
        order: true,
        user: true,
      }
    })

    return successResponse(refundRequest, '退款申请提交成功')
  } catch (error: any) {
    console.error('创建退款申请失败:', error)
    return errorResponse(error.message || '创建退款申请失败', 500)
  }
}
