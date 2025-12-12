import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        status: 'active',
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return successResponse(categories)
  } catch (error: any) {
    return errorResponse(error.message || '获取分类失败', 500)
  }
}

