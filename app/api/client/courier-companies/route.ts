import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

// 获取启用的物流公司列表（无需认证）
export async function GET(request: NextRequest) {
  try {
    const companies = await prisma.courierCompany.findMany({
      where: { status: 'active' },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        code: true,
        website: true,
        phone: true
      }
    })

    return successResponse(companies)
  } catch (error: any) {
    return errorResponse(error.message || '获取物流公司列表失败', 500)
  }
}
