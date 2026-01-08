import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthFromRequest } from '@/lib/api-utils'

// GET - 获取合同配置
export async function GET(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    // 从数据库读取配置
    const setting = await prisma.setting.findUnique({
      where: { key: 'contract_config' }
    })

    let config = null
    if (setting && typeof setting.value === 'string') {
      try {
        config = JSON.parse(setting.value)
      } catch (e) {
        console.error('解析合同配置失败:', e)
      }
    }

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error: any) {
    console.error('获取合同配置失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取合同配置失败' },
      { status: 500 }
    )
  }
}

// POST - 保存合同配置
export async function POST(request: NextRequest) {
  try {
    const auth = getAuthFromRequest(request)
    if (!auth || auth.type !== 'admin') {
      return NextResponse.json(
        { success: false, error: '未授权访问' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { config } = body

    if (!config) {
      return NextResponse.json(
        { success: false, error: '缺少配置数据' },
        { status: 400 }
      )
    }

    // 保存到数据库
    await prisma.setting.upsert({
      where: { key: 'contract_config' },
      update: {
        value: JSON.stringify(config)
      },
      create: {
        key: 'contract_config',
        value: JSON.stringify(config)
      }
    })

    return NextResponse.json({
      success: true,
      message: '保存成功'
    })
  } catch (error: any) {
    console.error('保存合同配置失败:', error)
    return NextResponse.json(
      { success: false, error: error.message || '保存合同配置失败' },
      { status: 500 }
    )
  }
}
