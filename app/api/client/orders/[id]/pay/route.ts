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
    const { paymentMethod } = data

    if (!paymentMethod) {
      return errorResponse('请选择支付方式', 400)
    }

    // 支付逻辑实现
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
