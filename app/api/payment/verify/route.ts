import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

// 支付宝同步返回验证
export async function POST(request: NextRequest) {
  try {
    const { params, orderId } = await request.json()

    console.log('🔍 开始验证支付宝同步返回...', { orderId })

    // 使用支付宝服务验证签名
    const alipayService = (await import('@/lib/payment/alipay')).default
    let verificationResult

    try {
      verificationResult = await alipayService.verifyPayment(params)
      console.log('✅ 支付宝签名验证结果:', verificationResult)
    } catch (error) {
      console.error('❌ 支付宝签名验证失败:', error)
      return errorResponse('签名验证失败')
    }

    // 验证成功且支付完成
    if (verificationResult.verified) {
      // 获取订单
      const order = await prisma.order.findFirst({
        where: { 
          OR: [
            { id: orderId },
            { orderNumber: verificationResult.outTradeNo }
          ]
        }
      })

      if (!order) {
        console.error('❌ 订单不存在:', { orderId, orderNumber: verificationResult.outTradeNo })
        return errorResponse('订单不存在')
      }

      // 如果支付成功，更新订单状态
      if (verificationResult.tradeStatus === 'TRADE_SUCCESS' || 
          verificationResult.tradeStatus === 'TRADE_FINISHED') {
        
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'paid',
            paymentStatus: 'paid',
            updatedAt: new Date()
          }
        })

        console.log('✅ 订单支付状态已更新:', { 
          orderId: order.id, 
          orderNumber: order.orderNumber,
          status: 'paid' 
        })

        return successResponse({
          verified: true,
          orderStatus: 'paid',
          tradeStatus: verificationResult.tradeStatus
        }, '支付验证成功')
      }

      // 支付等待中
      return successResponse({
        verified: true,
        orderStatus: order.status,
        tradeStatus: verificationResult.tradeStatus
      }, '支付处理中')
    }

    console.error('❌ 支付验证失败:', verificationResult)
    return errorResponse('支付验证失败')

  } catch (error: any) {
    console.error('❌ 支付验证处理失败:', error)
    return errorResponse(error.message || '支付验证失败')
  }
}
