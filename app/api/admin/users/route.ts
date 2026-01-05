import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkApiPermission } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  // 检查权限
  const authCheck = await checkApiPermission(request, 'user', 'read')
  if (!authCheck.authorized) {
    return authCheck.response!
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    const users = await prisma.user.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(users)
  } catch (error: any) {
    return errorResponse(error.message || '获取用户失败', 500)
  }
}

