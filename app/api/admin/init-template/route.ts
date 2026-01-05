import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TEMPLATE } from '@/types/contract-template'

export async function POST() {
  try {
    // 保存默认可视化模板到数据库
    await prisma.setting.upsert({
      where: { key: 'order_contract_template_json' },
      update: {
        value: JSON.stringify(DEFAULT_TEMPLATE)
      },
      create: {
        key: 'order_contract_template_json',
        value: JSON.stringify(DEFAULT_TEMPLATE)
      }
    })

    return NextResponse.json({
      success: true,
      message: '默认模板已初始化'
    })
  } catch (error: any) {
    console.error('初始化模板失败:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
