import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 获取单个物流公司
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const company = await prisma.courierCompany.findUnique({
      where: { id: params.id }
    })

    if (!company) {
      return errorResponse('物流公司不存在', 404)
    }

    return successResponse(company)
  } catch (error: any) {
    return errorResponse(error.message || '获取物流公司失败', 500)
  }
}

// 更新物流公司
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const body = await request.json()
    const { name, code, website, phone, sortOrder, status } = body

    const company = await prisma.courierCompany.findUnique({
      where: { id: params.id }
    })

    if (!company) {
      return errorResponse('物流公司不存在', 404)
    }

    // 检查名称或代码是否与其他公司冲突
    if (name || code) {
      const existing = await prisma.courierCompany.findFirst({
        where: {
          AND: [
            { id: { not: params.id } },
            {
              OR: [
                name ? { name } : {},
                code ? { code } : {}
              ]
            }
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
    }

    const updated = await prisma.courierCompany.update({
      where: { id: params.id },
      data: {
        name: name !== undefined ? name : undefined,
        code: code !== undefined ? code : undefined,
        website: website !== undefined ? website : undefined,
        phone: phone !== undefined ? phone : undefined,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
        status: status !== undefined ? status : undefined
      }
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(error.message || '更新物流公司失败', 500)
  }
}

// 删除物流公司
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const company = await prisma.courierCompany.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    if (!company) {
      return errorResponse('物流公司不存在', 404)
    }

    if (company._count.orders > 0) {
      return errorResponse('该物流公司已被使用，无法删除', 400)
    }

    await prisma.courierCompany.delete({
      where: { id: params.id }
    })

    return successResponse({ message: '删除成功' })
  } catch (error: any) {
    return errorResponse(error.message || '删除物流公司失败', 500)
  }
}
