import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const orders = await prisma.order.findMany({
      where: { userId: auth.id },
      include: {
        address: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(orders)
  } catch (error: any) {
    return errorResponse(error.message || '获取订单失败', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const { addressId, paymentMethod } = await request.json()

    if (!addressId) {
      return errorResponse('请选择收货地址')
    }

    // 获取购物车
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: auth.id },
      include: { product: true },
    })

    if (cartItems.length === 0) {
      return errorResponse('购物车为空')
    }

    // 检查库存
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return errorResponse(`商品 ${item.product.name} 库存不足`)
      }
    }

    // 计算总金额
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity
    }, 0)

    // 生成订单号
    const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // 创建订单
    const order = await prisma.order.create({
      data: {
        userId: auth.id,
        addressId,
        orderNumber,
        totalAmount,
        paymentMethod: paymentMethod || null,
        status: 'pending',
        paymentStatus: 'unpaid',
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
      include: {
        address: true,
        items: {
          include: { product: true },
        },
      },
    })

    // 更新库存
    for (const item of cartItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    // 清空购物车
    await prisma.cartItem.deleteMany({
      where: { userId: auth.id },
    })

    return successResponse(order)
  } catch (error: any) {
    return errorResponse(error.message || '创建订单失败', 500)
  }
}

