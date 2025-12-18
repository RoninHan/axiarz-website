import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    await verifyAdminAuth(request)

    // 用户统计（普通用户）
    const [totalUsers, activeUsers, disabledUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { status: 'disabled' } }),
    ])

    // 管理员统计
    const adminUsers = await prisma.admin.count({ where: { status: 'active' } })

    // 订单统计
    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      salesAggregate,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: 'pending' } }),
      prisma.order.count({ where: { paymentStatus: 'paid' } }),
      prisma.order.count({ where: { status: 'shipped' } }),
      prisma.order.count({ where: { status: 'delivered' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'paid' },
      }),
    ])

    // 产品统计
    const [totalProducts, activeProducts, outOfStockProducts, allProducts] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'active' } }),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.product.findMany({ select: { stock: true, price: true } }),
    ])

    const lowStockProducts = allProducts.filter(p => p.stock > 0 && p.stock < 10).length
    const totalValue = allProducts.reduce((sum, p) => sum + (p.stock * Number(p.price)), 0)

    // 分类统计
    const [totalCategories, activeCategories] = await Promise.all([
      prisma.category.count(),
      prisma.category.count({ where: { status: 'active' } }),
    ])

    // 解决方案统计
    const [totalSolutions, activeSolutions] = await Promise.all([
      prisma.solution.count(),
      prisma.solution.count({ where: { status: 'active' } }),
    ])

    // 帮助文章统计
    const [totalHelpArticles, publishedHelpArticles, helpArticlesViewSum] = await Promise.all([
      prisma.helpArticle.count(),
      prisma.helpArticle.count({ where: { status: 'published' } }),
      prisma.helpArticle.aggregate({ _sum: { viewCount: true } }),
    ])

    // 文件统计
    const [totalFiles, allFiles] = await Promise.all([
      prisma.file.count(),
      prisma.file.findMany({ select: { mimeType: true, size: true } }),
    ])

    const imageFiles = allFiles.filter(f => f.mimeType?.startsWith('image/')).length
    const documentFiles = allFiles.filter(f => 
      f.mimeType?.includes('pdf') || 
      f.mimeType?.includes('doc') || 
      f.mimeType?.includes('xls') || 
      f.mimeType?.includes('ppt')
    ).length
    const totalSize = allFiles.reduce((sum, f) => sum + (f.size || 0), 0)

    return NextResponse.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          disabled: disabledUsers,
          admins: adminUsers,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          paid: paidOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          totalAmount: Number(salesAggregate._sum.totalAmount || 0),
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          outOfStock: outOfStockProducts,
          lowStock: lowStockProducts,
          totalValue: totalValue,
        },
        categories: {
          total: totalCategories,
          active: activeCategories,
        },
        solutions: {
          total: totalSolutions,
          active: activeSolutions,
        },
        helpArticles: {
          total: totalHelpArticles,
          published: publishedHelpArticles,
          totalViews: helpArticlesViewSum._sum.viewCount || 0,
        },
        files: {
          total: totalFiles,
          images: imageFiles,
          documents: documentFiles,
          totalSize: totalSize,
        },
      },
    })
  } catch (error: any) {
    console.error('获取统计数据失败:', error)
    
    // 认证相关错误返回 401
    const authErrors = ['未登录', 'Token 无效', '用户不存在', '权限不足', '账户已被禁用']
    const isAuthError = authErrors.some(msg => error.message?.includes(msg))
    
    return NextResponse.json(
      { success: false, error: error.message || '获取统计数据失败' },
      { status: isAuthError ? 401 : 500 }
    )
  }
}