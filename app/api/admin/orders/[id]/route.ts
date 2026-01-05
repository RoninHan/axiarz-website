import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkApiPermission } from '@/lib/api-middleware'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(request, 'order', 'read')
  if (!authCheck.authorized) return authCheck.response!

  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        address: true,
        items: {
          include: { product: true },
        },
        courierCompany: true,
        invoice: true,
        refunds: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        repairOrders: {
          orderBy: { createdAt: 'desc' },
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
  const authCheck = await checkApiPermission(request, 'order', 'update')
  if (!authCheck.authorized) return authCheck.response!

  try {
    const data = await request.json()
    const { status, shippingInfo, paymentStatus, courierCompanyId } = data

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return errorResponse('订单不存在', 404)
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (shippingInfo !== undefined) updateData.shippingInfo = shippingInfo
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (courierCompanyId !== undefined) updateData.courierCompanyId = courierCompanyId

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(error.message || '更新订单失败', 500)
  }
}

