import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 根据 slug 或 id 获取帮助文章详情
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const article = await prisma.helpArticle.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
        status: 'published',
      },
    })

    if (!article) {
      return NextResponse.json({ success: false, error: '文章不存在' }, { status: 404 })
    }

    // 增加浏览次数
    await prisma.helpArticle.update({
      where: { id: article.id },
      data: { viewCount: article.viewCount + 1 },
    })

    return NextResponse.json({ success: true, data: { ...article, viewCount: article.viewCount + 1 } })
  } catch (error: any) {
    console.error('Failed to fetch help article:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
