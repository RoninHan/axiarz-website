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
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: '提现金额必须大于0' },
        { status: 400 }
      )
    }

    // 获取钱包
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: '钱包不存在' },
        { status: 404 }
      )
    }

    const amountDecimal = new Decimal(amount)
    const currentBalance = new Decimal(wallet.balance)

    if (currentBalance.lessThan(amountDecimal)) {
      return NextResponse.json(
        { success: false, error: '余额不足' },
        { status: 400 }
      )
    }

    const newBalance = currentBalance.minus(amountDecimal)

    // 更新钱包余额并创建交易记录
    const [updatedWallet, transaction] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data: { balance: newBalance },
      }),
      prisma.walletTransaction.create({
        data: {
          userId,
          type: 'WITHDRAW',
          amount: amountDecimal,
          balance: newBalance,
          description: `提现 ¥${amount}`,
          status: 'pending', // 提现需要审核
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        balance: Number(updatedWallet.balance),
        transaction: {
          ...transaction,
          amount: Number(transaction.amount),
          balance: Number(transaction.balance),
        },
      },
    })
  } catch (error) {
    console.error('提现错误:', error)
    return NextResponse.json(
      { success: false, error: '提现失败' },
      { status: 500 }
    )
  }
}
