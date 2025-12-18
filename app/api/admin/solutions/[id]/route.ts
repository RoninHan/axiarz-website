import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'

// GET - 获取单个解决方案
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdminAuth(req)

    const solution = await prisma.solution.findUnique({
      where: { id: params.id },
    })

    if (!solution) {
      return NextResponse.json({ success: false, error: '解决方案不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: solution })
  } catch (error: any) {
    console.error('Failed to fetch solution:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 401 })
  }
}

// PUT - 更新解决方案
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    // 检查 slug 是否与其他记录冲突
    const existingSolution = await prisma.solution.findUnique({
      where: { slug },
    })

    if (existingSolution && existingSolution.id !== params.id) {
      return NextResponse.json(
        { success: false, error: '该标识已存在，请使用其他标识' },
        { status: 400 }
      )
    }

    const solution = await prisma.solution.update({
      where: { id: params.id },
      data: {
        title,
        slug,
        description,
        content,
        coverImage,
        status,
        sortOrder,
      },
    })

    return NextResponse.json({ success: true, data: solution })
  } catch (error: any) {
    console.error('Failed to update solution:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE - 删除解决方案
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdminAuth(req)

    await prisma.solution.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: '删除成功' })
  } catch (error: any) {
    console.error('Failed to delete solution:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
