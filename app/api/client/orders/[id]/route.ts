import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
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
      include: {
        address: true,
        items: {
          include: { product: true },
        },
      },
    })

    if (!order || order.userId !== auth.id) {
      return errorResponse('订单不存在', 404)
    }

    return successResponse(order)
  } catch (error: any) {
    return errorResponse(error.message || '获取订单详情失败', 500)
  }
}

