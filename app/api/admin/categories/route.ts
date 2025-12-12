import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return successResponse(categories)
  } catch (error: any) {
    return errorResponse(error.message || '获取分类失败', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const data = await request.json()
    const { name, description, sortOrder, status } = data

    if (!name) {
      return errorResponse('分类名称不能为空')
    }

    // 检查分类名称是否已存在
    const existing = await prisma.category.findUnique({
      where: { name },
    })

    if (existing) {
      return errorResponse('分类名称已存在')
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        sortOrder: sortOrder || 0,
        status: status || 'active',
      },
    })

    return successResponse(category)
  } catch (error: any) {
    return errorResponse(error.message || '创建分类失败', 500)
  }
}

