import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 获取单个发票详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            },
            items: {
              include: {
                product: true
              }
            }
          }
        }
      }
    })

    if (!invoice) {
      return errorResponse('发票不存在', 404)
    }

    return successResponse(invoice)
  } catch (error: any) {
    return errorResponse(error.message || '获取发票详情失败', 500)
  }
}

// 更新发票状态
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
    const { status, invoiceNumber, invoiceUrl, rejectionReason } = body

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id }
    })

    if (!invoice) {
      return errorResponse('发票不存在', 404)
    }

    const updateData: any = {}
    if (status) updateData.status = status
    if (invoiceNumber !== undefined) updateData.invoiceNumber = invoiceNumber
    if (invoiceUrl !== undefined) updateData.invoiceUrl = invoiceUrl
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(error.message || '更新发票失败', 500)
  }
}
