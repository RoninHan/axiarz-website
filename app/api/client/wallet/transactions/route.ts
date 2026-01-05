import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const transactions = await prisma.walletTransaction.findMany({
      where: { userId: auth.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // 最近50条记录
    })

    return successResponse(transactions)
  } catch (error: any) {
    console.error('获取交易记录失败:', error)
    return errorResponse(error.message || '获取交易记录失败', 500)
  }
}
