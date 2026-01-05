import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
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

    // 获取交易记录
    const transactions = await prisma.walletTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      data: {
        balance: Number(wallet.balance),
        frozen: Number(wallet.frozen),
        transactions: transactions.map((t) => ({
          ...t,
          amount: Number(t.amount),
          balance: Number(t.balance),
        })),
      },
    })
  } catch (error) {
    console.error('获取钱包信息错误:', error)
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    )
  }
}
