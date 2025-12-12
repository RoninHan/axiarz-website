import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'
import { promises as fs } from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const files = await prisma.file.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return successResponse(files)
  } catch (error: any) {
    return errorResponse(error.message || '获取文件列表失败', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return errorResponse('请上传文件', 400)
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')

    await fs.mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name) || ''
    const baseName = path.basename(file.name, ext)
    const timestamp = Date.now()
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9_\-]/g, '_')
    const filename = `${safeBaseName}_${timestamp}${ext}`
    const filePath = path.join(uploadDir, filename)
    const url = `/uploads/${filename}`

    await fs.writeFile(filePath, buffer)

    const created = await prisma.file.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: buffer.length,
        url,
        uploadedById: auth.id,
      },
    })

    return successResponse(created, '上传成功')
  } catch (error: any) {
    console.error('文件上传失败:', error)
    return errorResponse(error.message || '文件上传失败', 500)
  }
}







