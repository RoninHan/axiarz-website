import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: auth.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(cartItems)
  } catch (error: any) {
    return errorResponse(error.message || '获取购物车失败', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const { productId, quantity } = await request.json()

    if (!productId || !quantity) {
      return errorResponse('参数错误')
    }

    // 检查产品是否存在
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return errorResponse('产品不存在')
    }

    // 检查库存
    if (product.stock < quantity) {
      return errorResponse('库存不足')
    }

    // 更新或创建购物车项
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: {
          userId: auth.id,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        userId: auth.id,
        productId,
        quantity,
      },
      include: { product: true },
    })

    return successResponse(cartItem)
  } catch (error: any) {
    return errorResponse(error.message || '加入购物车失败', 500)
  }
}

