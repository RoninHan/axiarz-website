import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkApiPermission } from '@/lib/api-middleware'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 检查更新权限
  const authCheck = await checkApiPermission(request, 'user', 'update')
  if (!authCheck.authorized) {
    return authCheck.response!
  }

  try {
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

