import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkApiPermission } from '@/lib/api-middleware'

// 获取单个优惠券
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(request, 'coupon', 'read')
  if (!authCheck.authorized) return authCheck.response!

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id },
      include: {
        userCoupons: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        }
      }
    })

    if (!coupon) {
      return errorResponse('优惠券不存在', 404)
    }

    return successResponse(coupon)
  } catch (error: any) {
    return errorResponse(error.message || '获取优惠券失败', 500)
  }
}

// 更新优惠券
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(request, 'coupon', 'update')
  if (!authCheck.authorized) return authCheck.response!

  try {
    const data = await request.json()

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom) : undefined,
        validTo: data.validTo ? new Date(data.validTo) : undefined
      }
    })

    return successResponse(coupon, '优惠券更新成功')
  } catch (error: any) {
    return errorResponse(error.message || '更新优惠券失败', 500)
  }
}

// 删除优惠券
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(request, 'coupon', 'delete')
  if (!authCheck.authorized) return authCheck.response!

  try {
    await prisma.coupon.delete({
      where: { id: params.id }
    })

    return successResponse(null, '优惠券删除成功')
  } catch (error: any) {
    return errorResponse(error.message || '删除优惠券失败', 500)
  }
}
