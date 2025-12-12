import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const addresses = await prisma.address.findMany({
      where: { userId: auth.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })

    return successResponse(addresses)
  } catch (error: any) {
    return errorResponse(error.message || '获取地址失败', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const data = await request.json()
    const { name, phone, province, city, district, detail, postalCode, isDefault } = data

    if (!name || !phone || !province || !city || !district || !detail) {
      return errorResponse('请填写完整地址信息')
    }

    // 如果设为默认地址，取消其他默认地址
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: auth.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await prisma.address.create({
      data: {
        userId: auth.id,
        name,
        phone,
        province,
        city,
        district,
        detail,
        postalCode: postalCode || null,
        isDefault: isDefault || false,
      },
    })

    return successResponse(address)
  } catch (error: any) {
    return errorResponse(error.message || '创建地址失败', 500)
  }
}

