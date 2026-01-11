import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'
import { Decimal } from '@prisma/client/runtime/library'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: NextRequest) {
  try {
    // 获取 token
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      )
    }

    // 验证 token
    let userId: string
    try {
      const decoded = verify(token, JWT_SECRET) as { id: string }
      userId = decoded.id
    } catch (error) {
      return NextResponse.json(
        { success: false, error: '登录已过期' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, paymentMethod } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: '充值金额必须大于0' },
        { status: 400 }
      )
    }

    if (!paymentMethod) {
      return NextResponse.json(
        { success: false, error: '请选择支付方式' },
        { status: 400 }
      )
    }

    // 验证支付方式是否启用
    const paymentConfig = await prisma.paymentConfig.findFirst({
      where: { 
        name: paymentMethod,
        enabled: true 
      }
    })

    if (!paymentConfig) {
      return NextResponse.json(
        { success: false, error: '不支持的支付方式' },
        { status: 400 }
      )
    }

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      )
    }

    // 获取或创建钱包
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          frozen: 0,
        },
      })
    }

    const amountDecimal = new Decimal(amount)

    // 创建充值交易记录（状态为pending，等待支付完成）
    const transaction = await prisma.walletTransaction.create({
      data: {
        userId,
        type: 'RECHARGE',
        amount: amountDecimal,
        balance: new Decimal(wallet.balance), // 当前余额，支付成功后才更新
        description: `通过${paymentConfig.displayName}充值 ¥${amount}`,
        status: 'pending',
      },
    })

    // 调用支付接口
    if (paymentMethod === 'alipay') {
      try {
        // 获取支付宝配置（包含 returnUrl）
        const alipayPaymentConfig = await prisma.paymentConfig.findUnique({
          where: { name: 'alipay' }
        })

        if (!alipayPaymentConfig?.config || typeof alipayPaymentConfig.config !== 'object') {
          return NextResponse.json({
            success: false,
            message: '支付宝配置信息不完整'
          }, { status: 500 })
        }

        const alipayConfig = alipayPaymentConfig.config as any
        const baseUrl = alipayConfig.returnUrl || alipayConfig.notifyUrl?.replace('/api/payment/callback', '') || process.env.NEXT_PUBLIC_APP_URL
        
        if (!baseUrl) {
          return NextResponse.json({
            success: false,
            message: '支付宝配置缺少回调地址，请在后台支付配置中设置'
          }, { status: 500 })
        }

        const returnUrl = `${baseUrl}/profile?tab=wallet&recharge=success`

        // 使用支付宝服务
        const alipayService = (await import('@/lib/payment/alipay')).default
        const result = await alipayService.createPayment(
          transaction.id, // 使用交易记录ID
          transaction.id, // 使用交易记录ID作为订单号
          Number(amount),
          `钱包充值 ¥${amount}`,
          returnUrl
        )

        return NextResponse.json({
          success: true,
          data: {
            transactionId: transaction.id,
            paymentUrl: result.paymentUrl,
            paymentMethod: 'alipay',
            amount: Number(amount),
          },
          message: '支付宝支付链接生成成功'
        })
      } catch (error: any) {
        console.error('❌ 支付宝充值支付创建失败:', {
          transactionId: transaction.id,
          error: error.message,
          stack: error.stack
        })

        // 更新交易状态为失败
        await prisma.walletTransaction.update({
          where: { id: transaction.id },
          data: { status: 'failed' }
        })

        let userMessage = '支付创建失败，请稍后重试'
        if (error.message?.includes('超时') || error.message?.includes('timeout')) {
          userMessage = '网络请求超时，请检查网络连接后重试'
        } else if (error.message?.includes('配置')) {
          userMessage = '支付配置错误，请联系客服'
        }

        return NextResponse.json(
          { success: false, error: userMessage },
          { status: 500 }
        )
      }
    } else if (paymentMethod === 'wechat') {
      // TODO: 实现微信支付
      return NextResponse.json(
        { success: false, error: '微信支付暂未开放' },
        { status: 400 }
      )
    } else if (paymentMethod === 'paypal') {
      // TODO: 实现PayPal支付
      return NextResponse.json(
        { success: false, error: 'PayPal支付暂未开放' },
        { status: 400 }
      )
    } else {
      return NextResponse.json(
        { success: false, error: '不支持的支付方式' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('充值错误:', error)
    return NextResponse.json(
      { success: false, error: '充值失败' },
      { status: 500 }
    )
  }
}
