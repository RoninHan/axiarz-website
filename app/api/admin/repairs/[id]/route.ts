import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 获取单个维修工单
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const repairOrder = await prisma.repairOrder.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        order: true
      }
    })

    if (!repairOrder) {
      return errorResponse('维修工单不存在', 404)
    }

    return successResponse(repairOrder)
  } catch (error: any) {
    return errorResponse(error.message || '获取维修工单失败', 500)
  }
}

// 更新维修工单状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const { status, adminReply, solution } = await request.json()

    const updateData: any = {}
    if (status) updateData.status = status
    if (adminReply) updateData.adminReply = adminReply
    if (solution) updateData.solution = solution
    if (status === 'completed') updateData.completedAt = new Date()

    const repairOrder = await prisma.repairOrder.update({
      where: { id: params.id },
      data: updateData
    })

    return successResponse(repairOrder, '维修工单更新成功')
  } catch (error: any) {
    return errorResponse(error.message || '更新维修工单失败', 500)
  }
}
