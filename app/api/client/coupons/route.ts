import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 获取用户的优惠券列表
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // unused, used, expired

    const userCoupons = await prisma.userCoupon.findMany({
      where: {
        userId: auth.id,
        ...(status ? { status } : {})
      },
      include: {
        coupon: true
      },
      orderBy: { createdAt: 'desc' }
    })

    // 检查并更新过期的优惠券
    const now = new Date()
    const expiredCoupons = userCoupons.filter(
      uc => uc.status === 'unused' && new Date(uc.coupon.validTo) < now
    )

    if (expiredCoupons.length > 0) {
      await prisma.userCoupon.updateMany({
        where: {
          id: { in: expiredCoupons.map(c => c.id) }
        },
        data: { status: 'expired' }
      })
    }

    return successResponse(userCoupons)
  } catch (error: any) {
    return errorResponse(error.message || '获取优惠券失败', 500)
  }
}
