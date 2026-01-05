import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 获取用户的发票列表
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未授权', 401)
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        order: {
          userId: auth.id
        }
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(invoices)
  } catch (error: any) {
    return errorResponse(error.message || '获取发票列表失败', 500)
  }
}
