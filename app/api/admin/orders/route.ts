import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const orderNumber = searchParams.get('orderNumber')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (orderNumber) {
      where.orderNumber = { contains: orderNumber, mode: 'insensitive' }
    }

    const orders = await prisma.order.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(orders)
  } catch (error: any) {
    return errorResponse(error.message || '获取订单失败', 500)
  }
}

