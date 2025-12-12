import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const data = await request.json()
    const { name, phone, province, city, district, detail, postalCode, isDefault } = data

    const address = await prisma.address.findUnique({
      where: { id: params.id },
    })

    if (!address || address.userId !== auth.id) {
      return errorResponse('地址不存在', 404)
    }

    // 如果设为默认地址，取消其他默认地址
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: auth.id, isDefault: true },
        data: { isDefault: false },
      })
    }

    const updated = await prisma.address.update({
      where: { id: params.id },
      data: {
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

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(error.message || '更新地址失败', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const address = await prisma.address.findUnique({
      where: { id: params.id },
    })

    if (!address || address.userId !== auth.id) {
      return errorResponse('地址不存在', 404)
    }

    await prisma.address.delete({
      where: { id: params.id },
    })

    return successResponse(null, '删除成功')
  } catch (error: any) {
    return errorResponse(error.message || '删除失败', 500)
  }
}

