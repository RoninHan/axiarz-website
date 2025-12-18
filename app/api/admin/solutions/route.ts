import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'

// GET - 获取所有解决方案
export async function GET(req: NextRequest) {
  try {
    await verifyAdminAuth(req)

    const solutions = await prisma.solution.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, data: solutions })
  } catch (error: any) {
    console.error('Failed to fetch solutions:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 401 })
  }
}

// POST - 创建解决方案
export async function POST(req: NextRequest) {
  try {
    await verifyAdminAuth(req)

    const body = await req.json()
    const { title, slug, description, content, coverImage, status, sortOrder } = body

    // 验证必填字段
    if (!title || !slug || !content) {
      return NextResponse.json(
        { success: false, error: '标题、标识和内容为必填项' },
        { status: 400 }
      )
    }

    // 检查 slug 是否已存在
    const existingSolution = await prisma.solution.findUnique({
      where: { slug },
    })

    if (existingSolution) {
      return NextResponse.json(
        { success: false, error: '该标识已存在，请使用其他标识' },
        { status: 400 }
      )
    }

    const solution = await prisma.solution.create({
      data: {
        title,
        slug,
        description,
        content,
        coverImage,
        status: status || 'draft',
        sortOrder: sortOrder || 0,
      },
    })

    return NextResponse.json({ success: true, data: solution })
  } catch (error: any) {
    console.error('Failed to create solution:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
