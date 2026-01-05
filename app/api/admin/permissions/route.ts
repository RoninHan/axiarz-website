import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdmin } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdmin(req)
    if (!admin || admin.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    })

    return NextResponse.json({ success: true, data: permissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json({ success: false, error: '获取权限列表失败' }, { status: 500 })
  }
}
