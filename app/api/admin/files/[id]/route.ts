import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkApiPermission } from '@/lib/api-middleware'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(request, 'file', 'read')
  if (!authCheck.authorized) return authCheck.response!

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authCheck = await checkApiPermission(request, 'file', 'delete')
  if (!authCheck.authorized) return authCheck.response!

  try {
    const file = await prisma.file.findUnique({
      where: { id: params.id },
    })

    if (!file) {
      return errorResponse('文件不存在', 404)
    }

    // 删除物理文件（如果存在）
    const filePath = path.join(process.cwd(), 'public', file.url.replace(/^\//, ''))
    try {
      await fs.unlink(filePath)
    } catch {
      // 如果物理文件不存在，忽略错误
    }

    await prisma.file.delete({
      where: { id: params.id },
    })

    return successResponse(null, '删除成功')
  } catch (error: any) {
    return errorResponse(error.message || '删除文件失败', 500)
  }
}







