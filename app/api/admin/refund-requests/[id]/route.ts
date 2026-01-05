import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkApiPermission } from '@/lib/api-middleware'
import { alipayService } from '@/lib/payment/alipay'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(request, 'refund', 'update')
  if (!authCheck.authorized) return authCheck.response!

  try {
    const data = await request.json()
    const { action, adminNote } = data

    if (!action || !['approve', 'reject'].includes(action)) {
      return errorResponse('无效的操作', 400)
    }

    // 获取退款申请
    const refundRequest = await prisma.refundRequest.findUnique({
      where: { id: params.id },
      include: { order: true, user: true }
    })

    if (!refundRequest) {
      return errorResponse('退款申请不存在', 404)
    }

    if (refundRequest.status !== 'pending') {
      return errorResponse('该退款申请已被处理', 400)
    }

    if (action === 'approve') {
      try {
        // 批准退款申请
        const updatedRequest = await prisma.refundRequest.update({
          where: { id: params.id },
          data: {
            status: 'approved',
            adminNote,
            updatedAt: new Date()
          },
          include: {
            order: true,
            user: true
          }
        })

        // 处理实际退款
        if (refundRequest.refundMethod === 'original') {
          // 原路退款 - 调用支付宝退款API
          console.log('🔄 处理原路退款申请', {
            orderNumber: refundRequest.order.orderNumber,
            refundAmount: refundRequest.amount
          })

          try {
            const refundResult = await alipayService.refund(
              refundRequest.order.orderNumber,
              Number(refundRequest.amount),
              refundRequest.reason
            )

            // 退款成功，更新状态
            await prisma.refundRequest.update({
              where: { id: params.id },
              data: {
                status: 'completed',
                refundTime: new Date(),
              }
            })

            // 更新订单状态为已退款
            await prisma.order.update({
              where: { id: refundRequest.orderId },
              data: {
                status: 'refunded',
                paymentStatus: 'refunded',
              }
            })

            console.log('✅ 原路退款处理成功', refundResult)

            return successResponse(updatedRequest, '退款申请已批准，原路退款处理成功')

          } catch (refundError: any) {
            console.error('❌ 原路退款处理失败:', refundError.message)

            // 退款失败，记录错误信息
            await prisma.refundRequest.update({
              where: { id: params.id },
              data: {
                adminNote: `${adminNote}\n\n退款处理失败: ${refundError.message}`,
              }
            })

            return errorResponse(`退款申请已批准，但退款处理失败: ${refundError.message}`, 500)
          }

        } else if (refundRequest.refundMethod === 'bank') {
          // 银行卡退款 - 记录信息，等待人工处理
          console.log('🔄 银行卡退款申请已批准，等待人工处理', {
            bankName: refundRequest.bankName,
            accountName: refundRequest.accountName,
            amount: refundRequest.amount
          })

          // 对于银行卡退款，我们标记为已批准状态，等待人工转账后标记为完成
          // 实际项目中可以在这里发送通知给财务人员

          return successResponse(updatedRequest, '退款申请已批准，请财务人员处理银行卡转账')
        }

      } catch (error: any) {
        console.error('批准退款申请失败:', error)
        return errorResponse(error.message || '批准退款申请失败', 500)
      }

    } else if (action === 'reject') {
      // 拒绝退款申请
      const updatedRequest = await prisma.refundRequest.update({
        where: { id: params.id },
        data: {
          status: 'rejected',
          adminNote,
          updatedAt: new Date()
        },
        include: {
          order: true,
          user: true
        }
      })

      return successResponse(updatedRequest, '退款申请已拒绝')
    }

  } catch (error: any) {
    console.error('处理退款申请失败:', error)
    return errorResponse(error.message || '处理退款申请失败', 500)
  }
}
