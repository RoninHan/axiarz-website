import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.categoryId = category
    }

    if (status) {
      where.status = status
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(products)
  } catch (error: any) {
    return errorResponse(error.message || '获取产品失败', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const data = await request.json()
    const { name, description, price, stock, image, images, categoryId, status, featured } = data

    if (!name || !price || stock === undefined) {
      return errorResponse('请填写完整产品信息')
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price,
        stock: parseInt(stock),
        image: image || null,
        images: images || [],
        categoryId: categoryId || null,
        status: status || 'active',
        featured: featured || false,
      },
      include: {
        category: true,
      },
    })

    return successResponse(product)
  } catch (error: any) {
    return errorResponse(error.message || '创建产品失败', 500)
  }
}

