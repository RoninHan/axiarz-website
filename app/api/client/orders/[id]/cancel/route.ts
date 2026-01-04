import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function POST(
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
      include: { items: { include: { product: true } } }
    })

    if (!order || order.userId !== auth.id) {
      return errorResponse('订单不存在', 404)
    }

    // 检查订单状态是否可以取消
    if (!['pending'].includes(order.status)) {
      return errorResponse('当前订单状态无法取消', 400)
    }

    // 取消订单
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      },
      include: {
        address: true,
        items: { include: { product: true } }
      }
    })

    return successResponse(updatedOrder, '订单已取消')
  } catch (error: any) {
    return errorResponse(error.message || '取消订单失败', 500)
  }
}
