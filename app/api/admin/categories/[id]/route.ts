import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!category) {
      return errorResponse('分类不存在', 404)
    }

    return successResponse(category)
  } catch (error: any) {
    return errorResponse(error.message || '获取分类失败', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const data = await request.json()
    const { name, description, sortOrder, status } = data

    const category = await prisma.category.findUnique({
      where: { id: params.id },
    })

    if (!category) {
      return errorResponse('分类不存在', 404)
    }

    // 如果更新名称，检查是否与其他分类重复
    if (name && name !== category.name) {
      const existing = await prisma.category.findUnique({
        where: { name },
      })
      if (existing) {
        return errorResponse('分类名称已存在')
      }
    }

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
        status: status !== undefined ? status : undefined,
      },
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(error.message || '更新分类失败', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: {
        products: true,
      },
    })

    if (!category) {
      return errorResponse('分类不存在', 404)
    }

    // 检查是否有产品使用此分类
    if (category.products.length > 0) {
      return errorResponse(`该分类下有 ${category.products.length} 个产品，无法删除`)
    }

    await prisma.category.delete({
      where: { id: params.id },
    })

    return successResponse(null, '删除成功')
  } catch (error: any) {
    return errorResponse(error.message || '删除失败', 500)
  }
}

