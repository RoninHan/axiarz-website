import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkApiPermission } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const authCheck = await checkApiPermission(request, 'refund', 'read')
  if (!authCheck.authorized) return authCheck.response!

  try {
    const refundRequests = await prisma.refundRequest.findMany({
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(refundRequests)
  } catch (error: any) {
    return errorResponse(error.message || '获取退款申请失败', 500)
  }
}
