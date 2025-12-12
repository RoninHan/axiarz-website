import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

