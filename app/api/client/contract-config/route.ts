import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 客户端获取合同配置（公开接口）
export async function GET(request: NextRequest) {
  try {
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

    // 如果没有配置，返回默认配置
    if (!config) {
      config = {
        sellerName: 'Axiarz 科技有限公司',
        sellerAddress: '广东省深圳市南山区科技园南区深圳湾科技生态园',
        sellerPhone: '400-123-4567',
        sellerTaxNumber: '91440300MA5XXXXX',
        sellerBankAccount: '中国银行深圳分行 1234 5678 9012 3456',
        qualityClause: '甲方保证所提供产品符合国家相关质量标准，若因产品质量问题导致乙方损失，甲方承担相应责任。',
        deliveryClause: '甲方承诺在收到乙方全额付款后 3-7 个工作日内发货，具体到货时间以物流公司配送时效为准。',
        paymentClause: '乙方应在下单时选择支付方式并完成付款，支持支付宝、微信支付等多种支付方式。',
        afterSalesClause: '产品自签收之日起享受 7 天无理由退换货服务（特殊商品除外），质保期内非人为损坏提供免费维修服务。',
        disputeClause: '如发生争议，双方应友好协商解决；协商不成的，可向甲方所在地人民法院提起诉讼。'
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
