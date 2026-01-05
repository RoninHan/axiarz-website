import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 获取物流公司列表
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const companies = await prisma.courierCompany.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    return successResponse(companies)
  } catch (error: any) {
    return errorResponse(error.message || '获取物流公司列表失败', 500)
  }
}

// 创建物流公司
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const body = await request.json()
    const { name, code, website, phone, sortOrder, status } = body

    if (!name || !code) {
      return errorResponse('公司名称和代码为必填项', 400)
    }

    // 检查代码是否已存在
    const existing = await prisma.courierCompany.findFirst({
      where: {
        OR: [
          { name },
          { code }
        ]
      }
    })

    if (existing) {
      if (existing.name === name) {
        return errorResponse('该公司名称已存在', 400)
      }
      if (existing.code === code) {
        return errorResponse('该公司代码已存在', 400)
      }
    }

    const company = await prisma.courierCompany.create({
      data: {
        name,
        code,
        website: website || null,
        phone: phone || null,
        sortOrder: sortOrder || 0,
        status: status || 'active'
      }
    })

    return successResponse(company)
  } catch (error: any) {
    return errorResponse(error.message || '创建物流公司失败', 500)
  }
}
