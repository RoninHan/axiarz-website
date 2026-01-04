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

    // 检查订单状态是否可以确认收货
    if (order.status !== 'shipped') {
      return errorResponse('当前订单状态无法确认收货', 400)
    }

    // 确认收货
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: 'delivered',
        updatedAt: new Date()
      },
      include: {
        address: true,
        items: { include: { product: true } }
      }
    })

    return successResponse(updatedOrder, '确认收货成功')
  } catch (error: any) {
    return errorResponse(error.message || '确认收货失败', 500)
  }
}
