import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: { include: { product: true } } }
    })

    if (!order || order.userId !== auth.id) {
      return errorResponse('订单不存在', 404)
    }

    // 检查订单状态是否可以支付
    if (order.status !== 'pending') {
      return errorResponse('订单状态不允许支付', 400)
    }

    const data = await request.json()
    const { paymentMethod, useWallet } = data

    if (!paymentMethod) {
      return errorResponse('请选择支付方式', 400)
    }

    // 钱包支付逻辑
    if (paymentMethod === 'wallet' || useWallet) {
      // 获取用户钱包
      let wallet = await prisma.wallet.findUnique({
        where: { userId: auth.id }
      })

      if (!wallet) {
        wallet = await prisma.wallet.create({
          data: {
            userId: auth.id,
            balance: 0,
            frozen: 0
          }
        })
      }

      const orderAmount = Number(order.totalAmount)
      const walletBalance = Number(wallet.balance)

      // 检查余额是否足够
      if (walletBalance < orderAmount) {
        return errorResponse(`钱包余额不足，当前余额 ¥${walletBalance.toFixed(2)}，需要 ¥${orderAmount.toFixed(2)}`, 400)
      }

      // 使用事务处理钱包扣款和订单更新
      const result = await prisma.$transaction(async (tx) => {
        // 扣除钱包余额
        const updatedWallet = await tx.wallet.update({
          where: { userId: auth.id },
          data: {
            balance: {
              decrement: orderAmount
            }
          }
        })

        // 创建钱包交易记录
        await tx.walletTransaction.create({
          data: {
            userId: auth.id,
            type: 'PAYMENT',
            amount: orderAmount,
            balance: Number(updatedWallet.balance),
            description: `支付订单 ${order.orderNumber}`,
            relatedId: order.id,
            status: 'completed'
          }
        })

        // 更新订单状态为已支付
        const updatedOrder = await tx.order.update({
          where: { id: params.id },
          data: {
            paymentMethod: 'wallet',
            paymentStatus: 'paid',
            status: 'paid',
            updatedAt: new Date()
          }
        })

        return { updatedWallet, updatedOrder }
      })

      return successResponse({
        paymentMethod: 'wallet',
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: orderAmount,
        remainingBalance: Number(result.updatedWallet.balance)
      }, '钱包支付成功')
    }

    // 支付宝支付逻辑
    if (paymentMethod === 'alipay') {
      try {
        // 使用支付宝服务
        const alipayService = (await import('@/lib/payment/alipay')).default
        const result = await alipayService.createPayment(
          order.id,
          order.orderNumber,
          Number(order.totalAmount),
          `Axiarz商品购买 - 订单号：${order.orderNumber}`,
          `${process.env.NEXT_PUBLIC_APP_URL}/orders/${params.id}/pay/success`
        )

        // 更新订单状态为支付中
        await prisma.order.update({
          where: { id: params.id },
          data: {
            paymentMethod: paymentMethod,
            paymentStatus: 'pending',
            updatedAt: new Date()
          }
        })

        return successResponse({
          paymentUrl: result.paymentUrl,
          paymentMethod: 'alipay',
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: Number(order.totalAmount),
        }, '支付宝支付链接生成成功')

      } catch (error: any) {
        console.error('❌ 支付宝支付创建失败:', {
          orderId: order.id,
          orderNumber: order.orderNumber,
          error: error.message,
          stack: error.stack
        })

        // 根据不同错误类型返回相应的用户友好的错误信息
        let userMessage = '支付创建失败，请稍后重试'

        if (error.message?.includes('超时') || error.message?.includes('timeout')) {
          userMessage = '网络请求超时，请检查网络连接后重试'
        } else if (error.message?.includes('配置')) {
          userMessage = '支付配置错误，请联系客服'
        } else if (error.message?.includes('签名')) {
          userMessage = '支付签名错误，请重试'
        }

        return errorResponse(userMessage, 500)
      }

    } else if (paymentMethod === 'wechat') {
      // 微信支付逻辑
      // 模拟微信支付二维码链接
      const wechatPaymentUrl = `https://api.mch.weixin.qq.com/pay/unifiedorder`

      // 更新订单状态为支付中
      await prisma.order.update({
        where: { id: params.id },
        data: {
          paymentMethod: paymentMethod,
          paymentStatus: 'pending',
          updatedAt: new Date()
        }
      })

      return successResponse({
        paymentUrl: wechatPaymentUrl,
        paymentMethod: 'wechat',
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADIAQAAAACFI5MzAAAB...`, // 模拟二维码
        orderId: order.id,
        orderNumber: order.orderNumber
      }, '支付二维码生成成功')

    } else {
      // 其他支付方式
      return errorResponse('不支持的支付方式', 400)
    }
  } catch (error: any) {
    return errorResponse(error.message || '支付失败', 500)
  }
}
