import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest, successResponse, errorResponse } from '@/lib/api-utils'

// 获取所有设置
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' },
    })

    // 转换为键值对对象
    const settingsMap: Record<string, any> = {}
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value
    })

    return successResponse(settingsMap)
  } catch (error: any) {
    return errorResponse(error.message || '获取设置失败', 500)
  }
}

// 更新设置
export async function PUT(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const { key, value } = await request.json()

    if (!key) {
      return errorResponse('设置键不能为空')
    }

    // 使用 upsert 创建或更新
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return successResponse(setting, '设置更新成功')
  } catch (error: any) {
    return errorResponse(error.message || '更新设置失败', 500)
  }
}

// 批量更新设置
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return errorResponse('未授权', 401)
    }

    const settings = await request.json()

    if (!settings || typeof settings !== 'object') {
      return errorResponse('设置数据格式错误')
    }

    // 批量更新
    const updates = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value: value as any },
        create: { key, value: value as any },
      })
    )

    await Promise.all(updates)

    return successResponse(null, '批量更新成功')
  } catch (error: any) {
    return errorResponse(error.message || '批量更新失败', 500)
  }
}
