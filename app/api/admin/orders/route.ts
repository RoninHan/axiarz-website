import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkApiPermission } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  // 检查订单读取权限
  const authCheck = await checkApiPermission(request, 'order', 'read')
  if (!authCheck.authorized) {
    return authCheck.response!
  }

  try {
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

