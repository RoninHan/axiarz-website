import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'

// GET - 获取单个帮助文章
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdminAuth(req)

    const article = await prisma.helpArticle.findUnique({
      where: { id: params.id },
    })

    if (!article) {
      return NextResponse.json({ success: false, error: '文章不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: article })
  } catch (error: any) {
    console.error('Failed to fetch help article:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 401 })
  }
}

// PUT - 更新帮助文章
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    // 检查 slug 是否与其他记录冲突
    const existingArticle = await prisma.helpArticle.findUnique({
      where: { slug },
    })

    if (existingArticle && existingArticle.id !== params.id) {
      return NextResponse.json(
        { success: false, error: '该标识已存在，请使用其他标识' },
        { status: 400 }
      )
    }

    const article = await prisma.helpArticle.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        category,
        content,
        excerpt,
        status,
        sortOrder,
        featured,
      },
    })

    return NextResponse.json({ success: true, data: article })
  } catch (error: any) {
    console.error('Failed to update help article:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - 删除帮助文章
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdminAuth(req)

    await prisma.helpArticle.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: '删除成功' })
  } catch (error: any) {
    console.error('Failed to delete help article:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
