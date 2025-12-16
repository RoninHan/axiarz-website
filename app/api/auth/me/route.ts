import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth) {
      return errorResponse('未登录', 401)
    }

    // 根据类型返回对应的用户信息
    if (auth.type === 'admin') {
      const admin = await prisma.admin.findUnique({
        where: { id: auth.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!admin || admin.status !== 'active') {
        return errorResponse('管理员不存在或已被禁用', 401)
      }

      return successResponse({ ...admin, type: 'admin' })
    } else {
      const user = await prisma.user.findUnique({
        where: { id: auth.id },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user || user.status !== 'active') {
        return errorResponse('用户不存在或已被禁用', 401)
      }

      return successResponse({ ...user, type: 'user' })
    }
  } catch (error: any) {
    return errorResponse(error.message || '获取用户信息失败', 500)
  }
}

