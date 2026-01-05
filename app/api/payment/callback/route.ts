import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 支付宝异步通知回调
export async function POST(request: NextRequest) {
  try {
    console.log('📥 收到支付宝异步回调')
    
    const body = await request.text()
    const params = new URLSearchParams(body)
    const paramsObj: Record<string, string> = {}

    // 转换参数为对象
    for (const [key, value] of params.entries()) {
      paramsObj[key] = value
    }

    console.log('📋 支付宝回调参数:', {
      out_trade_no: paramsObj.out_trade_no,
      trade_no: paramsObj.trade_no,
      trade_status: paramsObj.trade_status,
      total_amount: paramsObj.total_amount
    })

    // 使用支付宝服务验证签名
    const alipayService = (await import('@/lib/payment/alipay')).default
    let verificationResult

    try {
      verificationResult = await alipayService.verifyPayment(paramsObj)
    } catch (error) {
      console.error('❌ 支付宝签名验证失败:', error)
      return new NextResponse('fail')
    }

    if (verificationResult.verified &&
        (verificationResult.tradeStatus === 'TRADE_SUCCESS' || verificationResult.tradeStatus === 'TRADE_FINISHED')) {

      const outTradeNo = verificationResult.outTradeNo

      // 先检查是否是充值交易（以transaction ID的格式判断，或查询WalletTransaction表）
      const walletTransaction = await prisma.walletTransaction.findFirst({
        where: { id: outTradeNo }
      })

      if (walletTransaction) {
        // 处理充值回调
        if (walletTransaction.status === 'pending') {
          // 更新钱包余额
          const wallet = await prisma.wallet.findUnique({
            where: { userId: walletTransaction.userId }
          })

          if (wallet) {
            const newBalance = Number(wallet.balance) + Number(walletTransaction.amount)
            
            await prisma.$transaction([
              // 更新钱包余额
              prisma.wallet.update({
                where: { userId: walletTransaction.userId },
                data: { balance: newBalance }
              }),
              // 更新交易状态和余额
              prisma.walletTransaction.update({
                where: { id: walletTransaction.id },
                data: {
                  status: 'completed',
                  balance: newBalance
                }
              })
            ])

            console.log(`✅ 充值交易 ${walletTransaction.id} 完成，金额: ¥${walletTransaction.amount}，新余额: ¥${newBalance}`)
          }
        } else {
          console.log(`⚠️ 充值交易 ${walletTransaction.id} 状态已是 ${walletTransaction.status}，跳过处理`)
        }

        return new NextResponse('success')
      }

      // 处理订单支付回调
      const order = await prisma.order.findFirst({
        where: { orderNumber: outTradeNo }
      })

      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'paid',
            paymentStatus: 'paid',
            updatedAt: new Date()
          }
        })

        console.log(`✅ 订单 ${order.orderNumber} 支付成功，状态已更新`)
      } else {
        console.error(`❌ 未找到订单或交易记录: ${outTradeNo}`)
      }

      // 返回成功响应给支付宝
      return new NextResponse('success')
    }

    console.log('⚠️ 支付宝支付验证失败或状态不正确:', verificationResult)
    return new NextResponse('fail')

    return new NextResponse('fail')
  } catch (error) {
    console.error('支付回调处理失败:', error)
    return new NextResponse('fail')
  }
}
