import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const { status } = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      return errorResponse('用户不存在', 404)
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { status },
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(error.message || '更新用户失败', 500)
  }
}

