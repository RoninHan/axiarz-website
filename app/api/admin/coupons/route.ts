import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkApiPermission } from '@/lib/api-middleware'

// 获取所有优惠券
export async function GET(request: NextRequest) {
  // 检查读取权限
  const authCheck = await checkApiPermission(request, 'coupon', 'read')
  if (!authCheck.authorized) {
    return authCheck.response!
  }

  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { userCoupons: true }
        }
      }
    })

    return successResponse(coupons)
  } catch (error: any) {
    return errorResponse(error.message || '获取优惠券失败', 500)
  }
}

// 创建优惠券
export async function POST(request: NextRequest) {
  // 检查创建权限
  const authCheck = await checkApiPermission(request, 'coupon', 'create')
  if (!authCheck.authorized) {
    return authCheck.response!
  }

  try {
    const {
      code,
      name,
      type,
      value,
      minAmount,
      maxDiscount,
      totalCount,
      validFrom,
      validTo,
      description
    } = await request.json()

    // 验证必填字段
    if (!code || !name || !type || !value || !totalCount || !validFrom || !validTo) {
      return errorResponse('缺少必要参数', 400)
    }

    // 验证优惠券代码是否已存在
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    })

    if (existingCoupon) {
      return errorResponse('优惠券代码已存在', 400)
    }

    // 创建优惠券
    const coupon = await prisma.coupon.create({
      data: {
        code,
        name,
        type,
        value,
        minAmount: minAmount || 0,
        maxDiscount: maxDiscount || null,
        totalCount,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        description
      }
    })

    return successResponse(coupon, '优惠券创建成功')
  } catch (error: any) {
    console.error('创建优惠券失败:', error)
    return errorResponse(error.message || '创建优惠券失败', 500)
  }
}
