import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const paymentConfig = await prisma.paymentConfig.findUnique({
      where: { id: params.id },
    })

    if (!paymentConfig) {
      return errorResponse('支付配置不存在', 404)
    }

    return successResponse(paymentConfig)
  } catch (error: any) {
    return errorResponse(error.message || '获取支付配置失败', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const data = await request.json()
    const { displayName, enabled, sortOrder, config } = data

    const paymentConfig = await prisma.paymentConfig.findUnique({
      where: { id: params.id },
    })

    if (!paymentConfig) {
      return errorResponse('支付配置不存在', 404)
    }

    // 如果更新了配置，验证参数格式
    if (config && !validatePaymentConfig(paymentConfig.name, config)) {
      return errorResponse('支付配置参数格式错误')
    }

    const updated = await prisma.paymentConfig.update({
      where: { id: params.id },
      data: {
        displayName: displayName !== undefined ? displayName : undefined,
        enabled: enabled !== undefined ? enabled : undefined,
        sortOrder: sortOrder !== undefined ? sortOrder : undefined,
        config: config !== undefined ? config : undefined,
      },
    })

    return successResponse(updated)
  } catch (error: any) {
    return errorResponse(error.message || '更新支付配置失败', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const paymentConfig = await prisma.paymentConfig.findUnique({
      where: { id: params.id },
    })

    if (!paymentConfig) {
      return errorResponse('支付配置不存在', 404)
    }

    await prisma.paymentConfig.delete({
      where: { id: params.id },
    })

    return successResponse(null, '删除成功')
  } catch (error: any) {
    return errorResponse(error.message || '删除失败', 500)
  }
}

function validatePaymentConfig(name: string, config: any): boolean {
  if (!config || typeof config !== 'object') {
    return false
  }

  switch (name) {
    case 'alipay':
      return !!(config.appId && config.privateKey && config.publicKey)
    case 'wechat':
      return !!(config.appId && config.mchId && config.apiKey)
    case 'paypal':
      return !!(config.clientId && config.clientSecret)
    default:
      return true
  }
}

