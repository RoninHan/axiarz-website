import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const [userCount, orderCount, totalSales, topProducts] = await Promise.all([
      prisma.user.count({ where: { status: 'active' } }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'paid' },
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ])

    // 获取热门产品详情
    const productIds = topProducts.map((p) => p.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        image: true,
      },
    })

    const topProductsWithDetails = topProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return {
        productId: item.productId,
        productName: product?.name || '未知产品',
        productImage: product?.image || null,
        totalQuantity: item._sum.quantity || 0,
      }
    })

    return successResponse({
      userCount,
      orderCount,
      totalSales: Number(totalSales._sum.totalAmount || 0),
      topProducts: topProductsWithDetails,
    })
  } catch (error: any) {
    return errorResponse(error.message || '获取统计数据失败', 500)
  }
}

