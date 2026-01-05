import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 获取用户的维修工单列表
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const repairOrders = await prisma.repairOrder.findMany({
      where: { userId: auth.id },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return successResponse(repairOrders)
  } catch (error: any) {
    return errorResponse(error.message || '获取维修工单失败', 500)
  }
}

// 创建维修工单
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'user') {
      return errorResponse('未登录', 401)
    }

    const { orderId, productName, issue, images } = await request.json()

    if (!orderId || !productName || !issue) {
      return errorResponse('缺少必要参数', 400)
    }

    // 验证订单是否存在且属于该用户
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: auth.id,
        status: 'delivered' // 只有已收货的订单才能申请维修
      }
    })

    if (!order) {
      return errorResponse('订单不存在或状态不允许申请维修', 404)
    }

    // 获取系统设置中的最大维修次数
    let maxRepairCount = 3 // 默认3次
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'max_repair_count' }
    })
    if (setting) {
      maxRepairCount = parseInt(setting.value)
    }

    // 检查该订单的维修次数
    const existingRepairs = await prisma.repairOrder.count({
      where: { orderId }
    })

    if (existingRepairs >= maxRepairCount) {
      return errorResponse(`该订单已达到最大维修次数（${maxRepairCount}次）`, 400)
    }

    // 生成维修工单号
    const orderNumber = `REP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // 创建维修工单
    const repairOrder = await prisma.repairOrder.create({
      data: {
        userId: auth.id,
        orderId,
        orderNumber,
        productName,
        issue,
        images: images || [],
        status: 'pending'
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            createdAt: true
          }
        }
      }
    })

    return successResponse(repairOrder, '维修工单创建成功')
  } catch (error: any) {
    console.error('创建维修工单失败:', error)
    return errorResponse(error.message || '创建维修工单失败', 500)
  }
}
