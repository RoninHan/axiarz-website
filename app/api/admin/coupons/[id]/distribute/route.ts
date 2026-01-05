import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 发放优惠券给用户
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const { userIds } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return errorResponse('请选择要发放的用户', 400)
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id }
    })

    if (!coupon) {
      return errorResponse('优惠券不存在', 404)
    }

    if (coupon.status !== 'active') {
      return errorResponse('优惠券未激活', 400)
    }

    // 检查优惠券数量
    const remainingCount = coupon.totalCount - coupon.usedCount
    if (remainingCount < userIds.length) {
      return errorResponse(`优惠券数量不足，剩余 ${remainingCount} 张`, 400)
    }

    // 批量创建用户优惠券
    const userCoupons = await prisma.userCoupon.createMany({
      data: userIds.map(userId => ({
        userId,
        couponId: params.id,
        status: 'unused'
      })),
      skipDuplicates: true
    })

    return successResponse(userCoupons, `成功发放 ${userCoupons.count} 张优惠券`)
  } catch (error: any) {
    console.error('发放优惠券失败:', error)
    return errorResponse(error.message || '发放优惠券失败', 500)
  }
}
