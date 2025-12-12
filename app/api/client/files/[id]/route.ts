import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const file = await prisma.file.findUnique({
      where: { id: params.id },
    })

    if (!file) {
      return errorResponse('文件不存在', 404)
    }

    return successResponse(file)
  } catch (error: any) {
    return errorResponse(error.message || '获取文件失败', 500)
  }
}







