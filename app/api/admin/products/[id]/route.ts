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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
      },
    })

    if (!product) {
      return errorResponse('产品不存在', 404)
    }

    return successResponse(product)
  } catch (error: any) {
    return errorResponse(error.message || '获取产品详情失败', 500)
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
    const { name, description, price, stock, image, images, categoryId, status, featured } = data

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return errorResponse('产品不存在', 404)
    }

    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        image,
        images,
        categoryId: categoryId !== undefined ? (categoryId || null) : undefined,
        status,
        featured,
      },
      include: {
        category: true,
      },
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(error.message || '更新产品失败', 500)
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

    const product = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!product) {
      return errorResponse('产品不存在', 404)
    }

    await prisma.product.delete({
      where: { id: params.id },
    })

    return successResponse(null, '删除成功')
  } catch (error: any) {
    return errorResponse(error.message || '删除失败', 500)
  }
}

