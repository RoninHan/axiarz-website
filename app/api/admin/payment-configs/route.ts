import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const paymentConfigs = await prisma.paymentConfig.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return successResponse(paymentConfigs)
  } catch (error: any) {
    return errorResponse(error.message || '获取支付配置失败', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const data = await request.json()
    const { name, displayName, enabled, sortOrder, config } = data

    if (!name || !displayName) {
      return errorResponse('请填写支付方式名称')
    }

    // 验证配置参数
    if (!validatePaymentConfig(name, config)) {
      return errorResponse('支付配置参数格式错误')
    }

    const paymentConfig = await prisma.paymentConfig.create({
      data: {
        name,
        displayName,
        enabled: enabled || false,
        sortOrder: sortOrder || 0,
        config: config || {},
      },
    })

    return successResponse(paymentConfig)
  } catch (error: any) {
    return errorResponse(error.message || '创建支付配置失败', 500)
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
      return true // 自定义支付方式，不强制验证
  }
}

