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

    const { quantity } = await request.json()

    if (!quantity || quantity < 1) {
      return errorResponse('数量必须大于0')
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
      include: { product: true },
    })

    if (!cartItem || cartItem.userId !== auth.id) {
      return errorResponse('购物车项不存在', 404)
    }

    if (cartItem.product.stock < quantity) {
      return errorResponse('库存不足')
    }

    const updated = await prisma.cartItem.update({
      where: { id: params.id },
      data: { quantity },
      include: { product: true },
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(error.message || '更新购物车失败', 500)
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

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.id },
    })

    if (!cartItem || cartItem.userId !== auth.id) {
      return errorResponse('购物车项不存在', 404)
    }

    await prisma.cartItem.delete({
      where: { id: params.id },
    })

    return successResponse(null, '删除成功')
  } catch (error: any) {
    return errorResponse(error.message || '删除失败', 500)
  }
}

