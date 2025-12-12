import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const paymentConfigs = await prisma.paymentConfig.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: 'asc' },
    })

    return successResponse(paymentConfigs)
  } catch (error: any) {
    return errorResponse(error.message || '获取支付方式失败', 500)
  }
}

