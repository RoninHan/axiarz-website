import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'
import { Decimal } from '@prisma/client/runtime/library'

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const { userId, amount, description } = await request.json()

    if (!userId || !amount) {
      return errorResponse('缺少必要参数', 400)
    }

    if (amount <= 0) {
      return errorResponse('充值金额必须大于0', 400)
    }

    // 获取或创建用户钱包
    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          frozen: 0
        }
      })
    }

    const amountDecimal = new Decimal(amount)
    const newBalance = new Decimal(wallet.balance).plus(amountDecimal)

    // 更新钱包余额并创建交易记录
    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { balance: newBalance }
      }),
      prisma.walletTransaction.create({
        data: {
          userId,
          type: 'RECHARGE',
          amount: amountDecimal,
          balance: newBalance,
          description: description || `管理员充值 ¥${amount}`,
          status: 'completed'
        }
      })
    ])

    return successResponse({
      wallet: {
        ...updatedWallet,
        balance: Number(updatedWallet.balance),
        frozen: Number(updatedWallet.frozen)
      },
      transaction: {
        ...transaction,
        amount: Number(transaction.amount),
        balance: Number(transaction.balance)
      }
    }, '充值成功')
  } catch (error: any) {
    console.error('管理员充值失败:', error)
    return errorResponse(error.message || '充值失败', 500)
  }
}
