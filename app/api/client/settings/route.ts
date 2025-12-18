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
      heroTitle: settingsMap.heroTitle || '创新科技',
      heroSubtitle: settingsMap.heroSubtitle || '智享生活',
      heroDescription: settingsMap.heroDescription || '我们致力于提供高品质的科技产品，采用最新技术，性能卓越。让科技融入生活，让创新改变未来。',
      statsCustomers: settingsMap.statsCustomers || 1000,
      statsRating: settingsMap.statsRating || 98,
      aboutUs: settingsMap.aboutUs || '',
      contactEmail: settingsMap.contactEmail || 'support@axiarz.com',
      contactPhone: settingsMap.contactPhone || '400-123-4567',
      brandAdvantages: settingsMap.brandAdvantages || [],
      testimonials: settingsMap.testimonials || [],
    }

    return successResponse(publicSettings)
  } catch (error: any) {
    return errorResponse(error.message || '获取设置失败', 500)
  }
}
