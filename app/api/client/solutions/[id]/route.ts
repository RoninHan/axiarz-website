import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 根据 slug 或 id 获取解决方案详情
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const solution = await prisma.solution.findFirst({
      where: {
        OR: [{ id: params.id }, { slug: params.id }],
        status: 'published',
      },
    })

    if (!solution) {
      return NextResponse.json({ success: false, error: '解决方案不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: solution })
  } catch (error: any) {
    console.error('Failed to fetch solution:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
