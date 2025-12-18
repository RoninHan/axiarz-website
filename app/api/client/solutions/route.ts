import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 获取已发布的解决方案列表
export async function GET(req: NextRequest) {
  try {
    const solutions = await prisma.solution.findMany({
      where: { status: 'published' },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImage: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: solutions })
  } catch (error: any) {
    console.error('Failed to fetch solutions:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
