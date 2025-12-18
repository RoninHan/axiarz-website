import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 获取已发布的帮助文章列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const where: any = { status: 'published' }
    if (category) where.category = category
    if (featured === 'true') where.featured = true

    const articles = await prisma.helpArticle.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        excerpt: true,
        featured: true,
        viewCount: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: articles })
  } catch (error: any) {
    console.error('Failed to fetch help articles:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
