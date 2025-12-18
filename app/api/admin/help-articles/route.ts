import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'

// GET - 获取所有帮助文章
export async function GET(req: NextRequest) {
  try {
    await verifyAdminAuth(req)

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')

    const where = category ? { category } : {}

    const articles = await prisma.helpArticle.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ success: true, data: articles })
  } catch (error: any) {
    console.error('Failed to fetch help articles:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 401 })
  }
}

// POST - 创建帮助文章
export async function POST(req: NextRequest) {
  try {
    await verifyAdminAuth(req)

    const body = await req.json()
    const { title, slug, category, content, excerpt, status, sortOrder, featured } = body

    // 验证必填字段
    if (!title || !slug || !category || !content) {
      return NextResponse.json(
        { success: false, error: '标题、标识、分类和内容为必填项' },
        { status: 400 }
      )
    }

    // 检查 slug 是否已存在
    const existingArticle = await prisma.helpArticle.findUnique({
      where: { slug },
    })

    if (existingArticle) {
      return NextResponse.json(
        { success: false, error: '该标识已存在，请使用其他标识' },
        { status: 400 }
      )
    }

    const article = await prisma.helpArticle.create({
      data: {
        title,
        slug,
        category,
        content,
        excerpt,
        status: status || 'draft',
        sortOrder: sortOrder || 0,
        featured: featured || false,
      },
    })

    return NextResponse.json({ success: true, data: article })
  } catch (error: any) {
    console.error('Failed to create help article:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
