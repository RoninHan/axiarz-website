import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        address: true,
        items: {
          include: { product: true },
        },
      },
    })

    if (!order) {
      return errorResponse('订单不存在', 404)
    }

    return successResponse(order)
  } catch (error: any) {
    return errorResponse(error.message || '获取订单详情失败', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const data = await request.json()
    const { status, shippingInfo, paymentStatus } = data

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return errorResponse('订单不存在', 404)
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: status || undefined,
        shippingInfo: shippingInfo !== undefined ? shippingInfo : undefined,
        paymentStatus: paymentStatus || undefined,
      },
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(error.message || '更新订单失败', 500)
  }
}

