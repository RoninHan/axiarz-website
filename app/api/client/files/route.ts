import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const files = await prisma.file.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(files)
  } catch (error: any) {
    return errorResponse(error.message || '获取文件列表失败', 500)
  }
}







