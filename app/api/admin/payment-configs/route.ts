import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { checkApiPermission } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  const authCheck = await checkApiPermission(request, 'payment', 'read')
  if (!authCheck.authorized) return authCheck.response!

  try {
    const paymentConfigs = await prisma.paymentConfig.findMany({
      orderBy: { sortOrder: 'asc' },
    })

    return successResponse(paymentConfigs)
  } catch (error: any) {
    return errorResponse(error.message || '获取支付配置失败', 500)
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await checkApiPermission(request, 'payment', 'create')
  if (!authCheck.authorized) return authCheck.response!

  try {
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
      // 支付宝必需字段：appId, privateKey, publicKey, notifyUrl
      return !!(config.appId && config.privateKey && config.publicKey && config.notifyUrl)
    case 'wechat':
      return !!(config.appId && config.mchId && config.apiKey)
    case 'paypal':
      return !!(config.clientId && config.clientSecret)
    default:
      return true // 自定义支付方式，不强制验证
  }
}

