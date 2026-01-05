import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 获取所有维修工单（后台）
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const repairOrders = await prisma.repairOrder.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        },
        order: {
          select: {
            orderNumber: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(repairOrders)
  } catch (error: any) {
    return errorResponse(error.message || '获取维修工单失败', 500)
  }
}
