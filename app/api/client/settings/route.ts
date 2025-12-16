import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

// 获取公开设置（客户端）
export async function GET(request: NextRequest) {
  try {
    const settings = await prisma.setting.findMany()

    // 转换为键值对对象
    const settingsMap: Record<string, any> = {}
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value
    })

    // 只返回公开的设置
    const publicSettings = {
      logo: settingsMap.logo || null,
      heroImage: settingsMap.heroImage || null,
      companyName: settingsMap.companyName || 'Axiarz',
      brandAdvantages: settingsMap.brandAdvantages || [],
      testimonials: settingsMap.testimonials || [],
    }

    return successResponse(publicSettings)
  } catch (error: any) {
    return errorResponse(error.message || '获取设置失败', 500)
  }
}
